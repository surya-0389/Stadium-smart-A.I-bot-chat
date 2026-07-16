require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database/db");

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const stadiumRoutes = require("./routes/stadium");
const crowdRoutes = require("./routes/crowd");
const ticketRoutes = require("./routes/tickets");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3000;

const { seedDatabase } = require("./database/seed");

// Auto-seed on first run
seedDatabase();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/stadium", stadiumRoutes);
app.use("/api/crowd", crowdRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", stadium: "Narendra Modi Stadium", timestamp: new Date().toISOString() });
});

// Serve frontend static files from project root (parent of backend/)
const frontendPath = path.join(__dirname, "..");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "p3-1.html"));
});

// SPA-style fallback for HTML pages without extension issues
app.get(["/p3-1", "/p3-2", "/p3-3"], (req, res) => {
  res.sendFile(path.join(frontendPath, `${req.path.slice(1)}.html`));
});

const os = require("os");

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const HOST = "0.0.0.0";
const localIP = getLocalIP();

app.listen(PORT, HOST, () => {
  console.log(`\n🏟️  Stadium AI Backend running`);
  console.log(`   PC:     http://localhost:${PORT}`);
  console.log(`   Phone:  http://${localIP}:${PORT}  (same WiFi required)`);
  console.log(`   API:    http://${localIP}:${PORT}/api/health`);
  console.log(`   Demo: fan1/fan123 | staff1/staff123 | admin1/admin123\n`);
});
