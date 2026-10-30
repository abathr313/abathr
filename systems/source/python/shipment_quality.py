"""Shipment exception report. Python 3.10+, standard library only."""
import argparse
import csv
import math
from collections import defaultdict
from pathlib import Path


def read_manifest(path):
    with Path(path).open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != ["shipment_id", "weight_kg"]:
            raise ValueError("Expected columns: shipment_id,weight_kg")
        rows = []
        for number, row in enumerate(reader, 2):
            if len(rows) >= 500:
                raise ValueError("Maximum 500 records per manifest")
            identifier = row.get("shipment_id", "").strip()
            raw = row.get("weight_kg", "")
            if None in row or not identifier or len(identifier) > 40 or not all(c.isascii() and (c.isalnum() or c in "_-") for c in identifier):
                raise ValueError(f"Invalid shipment ID at line {number}")
            try:
                weight = float(raw)
            except (TypeError, ValueError):
                raise ValueError(f"Invalid weight at line {number}") from None
            if not math.isfinite(weight) or not 0 <= weight <= 1_000_000:
                raise ValueError(f"Weight out of range at line {number}")
            rows.append((identifier, weight))
    if not rows:
        raise ValueError("Manifest cannot be empty")
    return rows


def reconcile(expected, received, tolerance=2):
    if not math.isfinite(tolerance) or tolerance < 0:
        raise ValueError("Tolerance must be finite and non-negative")
    a, b = defaultdict(list), defaultdict(list)
    for identifier, weight in expected:
        a[identifier].append(weight)
    for identifier, weight in received:
        b[identifier].append(weight)
    result = []
    for identifier in dict.fromkeys([*a, *b]):
        duplicate = len(a[identifier]) > 1 or len(b[identifier]) > 1
        delta = round(b[identifier][0] - a[identifier][0], 3) if not duplicate and a[identifier] and b[identifier] else None
        state = "duplicate" if duplicate else "unexpected" if not a[identifier] else "missing" if not b[identifier] else "variance" if abs(delta) > tolerance else "matched"
        result.append({"shipment_id": identifier, "expected_kg": a[identifier][0] if len(a[identifier]) == 1 else "", "received_kg": b[identifier][0] if len(b[identifier]) == 1 else "", "difference_kg": delta if delta is not None else "", "status": state})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("expected", type=Path)
    parser.add_argument("received", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--tolerance", type=float, default=2)
    args = parser.parse_args()
    try:
        if args.output.resolve() in (args.expected.resolve(), args.received.resolve()):
            raise ValueError("Output must differ from input files")
        result = reconcile(read_manifest(args.expected), read_manifest(args.received), args.tolerance)
        # Exclusive creation prevents accidental overwriting of an existing report.
        with args.output.open("x", encoding="utf-8-sig", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=list(result[0]))
            writer.writeheader()
            for row in result:
                row["shipment_id"] = "'" + row["shipment_id"] if row["shipment_id"].startswith(("=", "+", "-", "@")) else row["shipment_id"]
                writer.writerow(row)
        print(f"Report created: {len(result)} shipments, {sum(row['status'] != 'matched' for row in result)} exceptions")
    except (ValueError, OSError) as error:
        parser.exit(1, f"Error: {error}\n")


if __name__ == "__main__":
    main()
