import tempfile
import unittest
from pathlib import Path
from shipment_quality import read_manifest, reconcile


class QualityTests(unittest.TestCase):
    def test_duplicates_and_exceptions(self):
        result = reconcile([("A", 10), ("B", 5), ("C", 8)], [("A", 8), ("B", 5), ("B", 5), ("D", 2)], 2)
        self.assertEqual([row["status"] for row in result], ["matched", "duplicate", "missing", "unexpected"])
        self.assertEqual(result[1]["difference_kg"], "")

    def test_invalid_weights(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "test.csv"
            for value in ["nan", "inf", "-1", "", "1000001"]:
                path.write_text("shipment_id,weight_kg\nA," + value)
                with self.assertRaises(ValueError):
                    read_manifest(path)

    def test_tolerance(self):
        self.assertEqual(reconcile([("A", .1)], [("A", .3)], .2)[0]["status"], "matched")
        with self.assertRaises(ValueError):
            reconcile([], [], float("nan"))


if __name__ == "__main__":
    unittest.main()
