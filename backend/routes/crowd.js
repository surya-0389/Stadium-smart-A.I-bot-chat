const express = require("express");
const db = require("../database/db");
const { authRequired, requireRole } = require("../middleware/auth");
const { crowdLevelFromCount, getCrowdRecommendations } = require("../services/stadiumService");

const router = express.Router();

router.get("/status", (req, res) => {
  const data = getCrowdRecommendations();
  res.json(data);
});

router.get("/logs", authRequired, requireRole("staff", "admin"), (req, res) => {
  const logs = db.prepare(`
    SELECT cl.*, u.name as staff_name
    FROM crowd_logs cl
    LEFT JOIN users u ON cl.logged_by = u.id
    ORDER BY cl.created_at DESC LIMIT 50
  `).all();
  res.json({ logs });
});

router.put("/gates/:id", authRequired, requireRole("staff", "admin"), (req, res) => {
  const { peopleCount, crowdLevel, note } = req.body;
  const gate = db.prepare("SELECT * FROM gates WHERE id = ?").get(req.params.id);
  if (!gate) return res.status(404).json({ error: "Gate not found" });

  const count = peopleCount !== undefined ? Number(peopleCount) : gate.people_count;
  const level = crowdLevel || crowdLevelFromCount(count);

  db.prepare(
    "UPDATE gates SET people_count = ?, crowd_level = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(count, level, req.params.id);

  db.prepare(
    "INSERT INTO crowd_logs (gate_id, people_count, crowd_level, logged_by, note) VALUES (?, ?, ?, ?, ?)"
  ).run(req.params.id, count, level, req.user.id, note || null);

  const updated = db.prepare("SELECT * FROM gates WHERE id = ?").get(req.params.id);
  res.json({ gate: updated, recommendations: getCrowdRecommendations().recommendations });
});

module.exports = router;
