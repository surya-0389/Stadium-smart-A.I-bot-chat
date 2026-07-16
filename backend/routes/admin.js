const express = require("express");
const db = require("../database/db");
const { authRequired, requireRole } = require("../middleware/auth");
const { getCrowdRecommendations } = require("../services/stadiumService");

const router = express.Router();

router.use(authRequired);
router.use(requireRole("admin"));

router.get("/stats", (req, res) => {
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const fanCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'fan'").get().c;
  const ticketCount = db.prepare("SELECT COUNT(*) as c FROM tickets").get().c;
  const chatCount = db.prepare("SELECT COUNT(*) as c FROM chat_messages").get().c;
  const totalCrowd = db.prepare("SELECT SUM(people_count) as total FROM gates").get().total;

  res.json({
    users: userCount,
    fans: fanCount,
    tickets: ticketCount,
    chatMessages: chatCount,
    totalCrowdInStadium: totalCrowd,
    gates: db.prepare("SELECT * FROM gates").all(),
    transport: db.prepare("SELECT * FROM transport_routes").all(),
    recommendations: getCrowdRecommendations().recommendations
  });
});

router.get("/users", (req, res) => {
  const users = db.prepare("SELECT id, username, role, name, email, created_at FROM users").all();
  res.json({ users });
});

router.put("/transport/:id", (req, res) => {
  const { passengersWaiting, capacity } = req.body;
  const route = db.prepare("SELECT * FROM transport_routes WHERE id = ?").get(req.params.id);
  if (!route) return res.status(404).json({ error: "Route not found" });

  db.prepare(
    "UPDATE transport_routes SET passengers_waiting = COALESCE(?, passengers_waiting), capacity = COALESCE(?, capacity) WHERE id = ?"
  ).run(passengersWaiting ?? null, capacity ?? null, req.params.id);

  res.json({ route: db.prepare("SELECT * FROM transport_routes WHERE id = ?").get(req.params.id) });
});

router.put("/food/:id", (req, res) => {
  const { waitMinutes } = req.body;
  db.prepare("UPDATE food_counters SET wait_minutes = ? WHERE id = ?").run(waitMinutes, req.params.id);
  res.json({ counter: db.prepare("SELECT * FROM food_counters WHERE id = ?").get(req.params.id) });
});

module.exports = router;
