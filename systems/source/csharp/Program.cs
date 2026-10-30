using System.Globalization;
using System.Text.RegularExpressions;

// Read-only log triage tool. No network access, no alteration of input files.
if (args.Length != 1)
{
    Console.Error.WriteLine("Usage: dotnet run -- sample.log");
    return 1;
}
try
{
    var pattern = new Regex(@"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)\s+(INFO|WARN|ERROR)\s+([A-Za-z0-9_-]{1,40})\s+(.{1,500})$", RegexOptions.CultureInvariant, TimeSpan.FromSeconds(1));
    var entries = new List<LogEntry>();
    var rejected = new List<int>();
    var lines = File.ReadLines(args[0]).Where(line => !string.IsNullOrWhiteSpace(line)).Take(1001).ToArray();
    if (lines.Length == 0 || lines.Length > 1000) throw new ArgumentException("Provide between 1 and 1000 non-empty log lines.");
    for (int index = 0; index < lines.Length; index++)
    {
        var match = pattern.Match(lines[index]);
        if (!match.Success || !DateTimeOffset.TryParseExact(match.Groups[1].Value, "yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out _))
        {
            rejected.Add(index + 1);
            continue;
        }
        entries.Add(new(match.Groups[2].Value, match.Groups[3].Value, match.Groups[4].Value));
    }
    foreach (var level in new[] { "INFO", "WARN", "ERROR" })
        Console.WriteLine($"{level}: {entries.Count(entry => entry.Level == level)}");
    Console.WriteLine($"Rejected lines: {string.Join(", ", rejected)}");
    Console.WriteLine("Repeated errors:");
    foreach (var group in entries.Where(entry => entry.Level == "ERROR").GroupBy(entry => (entry.Service, entry.Message)).OrderByDescending(group => group.Count()))
        Console.WriteLine($"{group.Count()}x {group.Key.Service}: {group.Key.Message}");
    return 0;
}
catch (Exception error) when (error is IOException or UnauthorizedAccessException or ArgumentException or RegexMatchTimeoutException)
{
    Console.Error.WriteLine($"Error: {error.Message}");
    return 1;
}

record LogEntry(string Level, string Service, string Message);
