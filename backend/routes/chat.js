const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../database/db");
const { authOptional, authRequired } = require("../middleware/auth");
const { processMessage } = require("../services/aiService");

const router = express.Router();

function getUserTickets(userId) {
  if (!userId) return [];
  return db.prepare(
    "SELECT id, section, row_num, seat_num, match_name, match_date, status FROM tickets WHERE user_id = ? AND status = 'active'"
  ).all(userId);
}

router.post("/", authOptional, (req, res) => {
  const { message, sessionId, language } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  let sid = sessionId;
  if (!sid) {
    sid = uuidv4();
    db.prepare("INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)").run(sid, req.user?.id || null);
  } else {
    const session = db.prepare("SELECT id FROM chat_sessions WHERE id = ?").get(sid);
    if (!session) {
      db.prepare("INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)").run(sid, req.user?.id || null);
    }
  }

  const tickets = getUserTickets(req.user?.id);
  const { reply, intent, language: detectedLang } = processMessage(message.trim(), language, tickets);

  db.prepare(
    "INSERT INTO chat_messages (session_id, role, message, intent, language) VALUES (?, 'user', ?, ?, ?)"
  ).run(sid, message.trim(), intent, detectedLang);

  db.prepare(
    "INSERT INTO chat_messages (session_id, role, message, intent, language) VALUES (?, 'assistant', ?, ?, ?)"
  ).run(sid, reply, intent, detectedLang);

  res.json({ sessionId: sid, reply, intent, language: detectedLang });
});

router.get("/history/:sessionId", authOptional, (req, res) => {
  const messages = db.prepare(
    "SELECT role, message, intent, language, created_at FROM chat_messages WHERE session_id = ? ORDER BY id ASC"
  ).all(req.params.sessionId);
  res.json({ messages });
});

router.get("/sessions", authRequired, (req, res) => {
  const sessions = db.prepare(
    "SELECT id, created_at FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20"
  ).all(req.user.id);
  res.json({ sessions });
});

module.exports = router;
