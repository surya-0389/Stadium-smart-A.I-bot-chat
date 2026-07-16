const express = require("express");
const db = require("../database/db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/my", authRequired, (req, res) => {
  const tickets = db.prepare(
    "SELECT * FROM tickets WHERE user_id = ? AND status = 'active' ORDER BY match_date DESC"
  ).all(req.user.id);
  res.json({ tickets });
});

router.get("/section/:section", (req, res) => {
  const section = db.prepare("SELECT * FROM sections WHERE id = ?").get(req.params.section);
  if (!section) return res.status(404).json({ error: "Section not found" });
  const gate = db.prepare("SELECT * FROM gates WHERE id = ?").get(section.gate_id);
  res.json({ section, gate });
});

module.exports = router;
