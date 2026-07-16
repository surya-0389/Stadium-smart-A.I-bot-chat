require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const db = require("./db");

function seedDatabase() {
  const gateCount = db.prepare("SELECT COUNT(*) as c FROM gates").get().c;
  if (gateCount > 0) return false;

const hash = (pw) => bcrypt.hashSync(pw, 10);

const insertUser = db.prepare(
  "INSERT INTO users (username, password_hash, role, name, email) VALUES (?, ?, ?, ?, ?)"
);

const users = [
  ["fan1", hash("fan123"), "fan", "Rahul Sharma", "rahul@fan.com"],
  ["fan2", hash("fan123"), "fan", "Priya Patel", "priya@fan.com"],
  ["staff1", hash("staff123"), "staff", "Amit Kumar", "amit@stadium.com"],
  ["staff2", hash("staff123"), "staff", "Sneha Reddy", "sneha@stadium.com"],
  ["admin1", hash("admin123"), "admin", "Stadium Admin", "admin@stadium.com"]
];

users.forEach((u) => insertUser.run(...u));

const insertGate = db.prepare(
  "INSERT INTO gates (id, name, crowd_level, people_count, nearest) VALUES (?, ?, ?, ?, ?)"
);
[
  ["A", "Gate A — North", "low", 1200, "Section 101-120, Food Court 1"],
  ["B", "Gate B — East", "medium", 4500, "Section 201-220, Food Court 2"],
  ["C", "Gate C — South", "high", 8900, "Section 301-320, Ticket Counter"],
  ["D", "Gate D — West", "low", 2100, "Section 401-420, VIP Lounge"]
].forEach((g) => insertGate.run(...g));

const insertSection = db.prepare(
  "INSERT INTO sections (id, block, gate_id, row_guide) VALUES (?, ?, ?, ?)"
);
[
  ["101", "North Lower", "A", "Rows 1-30 run left to right. Aisle 15 is centre."],
  ["102", "North Lower", "A", "Near Gate A — follow blue signs."],
  ["201", "East Stand", "B", "Upper tier — use escalator near Gate B."],
  ["301", "South Stand", "C", "Main stand — giant screen behind you."],
  ["401", "West Pavilion", "D", "Pavilion end — premium seating zone."]
].forEach((s) => insertSection.run(...s));

const insertFood = db.prepare(
  "INSERT INTO food_counters (name, location, items, wait_minutes) VALUES (?, ?, ?, ?)"
);
[
  ["Food Court 1", "Gate A, Level 1", "Pizza, Burgers, Soft drinks", 5],
  ["Food Court 2", "Gate B, Level 2", "Indian thali, Chaat, Lassi", 8],
  ["Snack Kiosk 3", "Section 201 corridor", "Popcorn, Nachos, Coffee", 3],
  ["Halal Corner", "Gate C, Level 1", "Biryani, Kebabs, Juice", 12]
].forEach((f) => insertFood.run(...f));

const insertTransport = db.prepare(
  "INSERT INTO transport_routes (route, destination, frequency, stop_location, capacity, passengers_waiting) VALUES (?, ?, ?, ?, ?, ?)"
);
[
  ["B-42", "Ahmedabad Railway Station", "Every 8 min", "Gate C parking", 80, 340],
  ["B-17", "Sabarmati Metro", "Every 10 min", "Gate A exit", 60, 120],
  ["B-99", "Airport Road", "Every 15 min", "Gate D", 50, 45]
].forEach((t) => insertTransport.run(...t));

const fan1 = db.prepare("SELECT id FROM users WHERE username = ?").get("fan1");
const fan2 = db.prepare("SELECT id FROM users WHERE username = ?").get("fan2");

const insertTicket = db.prepare(
  "INSERT INTO tickets (user_id, section, row_num, seat_num, match_name, match_date) VALUES (?, ?, ?, ?, ?, ?)"
);
insertTicket.run(fan1.id, "201", 14, 8, "IPL Final 2026", "2026-07-15");
insertTicket.run(fan1.id, "301", 5, 12, "IPL Final 2026", "2026-07-15");
insertTicket.run(fan2.id, "101", 3, 22, "IPL Final 2026", "2026-07-15");

console.log("Database seeded successfully!");
console.log("Demo accounts:");
console.log("  Fan:   fan1 / fan123");
console.log("  Staff: staff1 / staff123");
console.log("  Admin: admin1 / admin123");
  return true;
}

module.exports = { seedDatabase };

if (require.main === module) {
  const seeded = seedDatabase();
  if (!seeded) console.log("Database already seeded.");
}
