# Shipment Quality — Python

Standard-library tool; Python 3.10+. Synthetic example files only.

```sh
python shipment_quality.py expected.csv received.csv report.csv --tolerance 2
python -m unittest discover -p "test_*.py"
```

Creates a new report; refuses to overwrite existing files or input manifests. Duplicate IDs are flagged and excluded from delta calculations. Inputs are not modified.
