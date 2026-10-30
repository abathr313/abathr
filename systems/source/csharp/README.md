# Log Desk — C#

A new read-only log triage tool, developed from the idea of the local LogFileViewer sample. Requires .NET SDK 8+. No NuGet packages.

```sh
dotnet run -- sample.log
```

Expected sample result: INFO 1, WARN 0, ERROR 2; line 4 rejected; billing timeout grouped twice. Original local project is untouched. No compiled EXE is included. The authoring machine did not have a .NET SDK, so this native source was reviewed but not compiled here; the browser demonstration uses a separately tested JavaScript engine.
