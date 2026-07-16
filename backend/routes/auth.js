const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { signToken, authRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, password, name, email } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: "Username, password and name are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (exists) return res.status(409).json({ error: "Username already taken" });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    "INSERT INTO users (username, password_hash, role, name, email) VALUES (?, ?, 'fan', ?, ?)"
  ).run(username, hash, name, email || null);

  const user = { id: result.lastInsertRowid, username, role: "fan", name };
  const token = signToken(user);
  res.status(201).json({ token, user });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const safeUser = { id: user.id, username: user.username, role: user.role, name: user.name, email: user.email };
  res.json({ token: signToken(safeUser), user: safeUser });
});

router.get("/me", authRequired, (req, res) => {
  const user = db.prepare("SELECT id, username, role, name, email, created_at FROM users WHERE id = ?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

module.exports = router;
