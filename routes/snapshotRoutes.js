const express = require("express");
const router = express.Router();
const Snapshot = require("../database/schemas/snapshotSchema"); 

/**
 * POST /api/snapshot
 * Receives current viewcounts from the frontend and saves them as a snapshot.
 * Body: { items: [{ id: string, viewcount: number }] }
 */
router.post("/", async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing or empty items array in request body" });
    }

    const snapshot = await Snapshot.create({ items });

    res.json({
      createdAt: snapshot.createdAt,
      items: snapshot.items,
    });
  } catch (err) {
    console.error("Snapshot POST error:", err);
    res.status(500).json({ error: "Failed to create snapshot" });
  }
});

/**
 * GET /api/snapshot/latest
 * Returns the most recent snapshot.
 */
router.get("/latest", async (req, res) => {
  try {
    const snapshot = await Snapshot.findOne().sort({ createdAt: -1 }).lean();

    if (!snapshot) {
      return res.status(404).json({ error: "No snapshot found" });
    }

    res.json({
      createdAt: snapshot.createdAt,
      items: snapshot.items,
    });
  } catch (err) {
    console.error("Snapshot GET error:", err);
    res.status(500).json({ error: "Failed to fetch snapshot" });
  }
});

module.exports = router;