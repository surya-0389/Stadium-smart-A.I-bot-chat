const db = require("../database/db");

function getStadiumData() {
  const gates = db.prepare("SELECT * FROM gates ORDER BY id").all().map((g) => ({
    id: g.id,
    name: g.name,
    crowd: g.crowd_level,
    peopleCount: g.people_count,
    nearest: g.nearest ? g.nearest.split(", ") : []
  }));

  const sections = {};
  db.prepare("SELECT * FROM sections").all().forEach((s) => {
    sections[s.id] = { block: s.block, gate: s.gate_id, rowGuide: s.row_guide };
  });

  const foodCounters = db.prepare("SELECT * FROM food_counters").all().map((f) => ({
    name: f.name,
    location: f.location,
    items: f.items,
    wait: `${f.wait_minutes} min`
  }));

  const buses = db.prepare("SELECT * FROM transport_routes").all().map((t) => ({
    route: t.route,
    destination: t.destination,
    frequency: t.frequency,
    stop: t.stop_location,
    capacity: t.capacity,
    passengersWaiting: t.passengers_waiting
  }));

  return {
    name: "Narendra Modi Stadium",
    capacity: 132000,
    gates,
    sections,
    foodCounters,
    ticketCounters: [
      { name: "Main Ticket Counter", location: "Gate C entrance", hours: "2 hrs before match" },
      { name: "Will-Call / Reprint", location: "Gate A, booth 2", hours: "Match day only" }
    ],
    transport: {
      buses,
      metro: { station: "Motera Metro", walk: "12 min from Gate B", lastTrain: "11:30 PM" },
      rideshare: { pickup: "Gate D rideshare zone", tip: "Use exit D to avoid Gate C crowd" }
    },
    restrooms: [
      { location: "Every 50 metres on concourse", accessible: true },
      { location: "Gate B Level 1 — family room", accessible: true }
    ],
    firstAid: { location: "Gate C, Room 12", phone: "108" }
  };
}

function crowdLevelFromCount(count) {
  if (count < 3000) return "low";
  if (count < 6000) return "medium";
  return "high";
}

function getCrowdRecommendations() {
  const gates = db.prepare("SELECT * FROM gates ORDER BY people_count DESC").all();
  const recommendations = [];

  const highGates = gates.filter((g) => g.crowd_level === "high");
  if (highGates.length > 0) {
    recommendations.push({
      priority: "high",
      gate: highGates[0].id,
      message: `Gate ${highGates[0].id} has ${highGates[0].people_count} people. Open overflow lanes and redirect fans to Gate A or D.`,
      action: "redirect_crowd"
    });
  }

  const lowGates = gates.filter((g) => g.crowd_level === "low");
  if (lowGates.length > 0 && highGates.length > 0) {
    recommendations.push({
      priority: "medium",
      gate: lowGates[0].id,
      message: `Direct incoming fans to ${lowGates[0].name} — only ${lowGates[0].people_count} people currently.`,
      action: "open_gate"
    });
  }

  const transport = db.prepare("SELECT * FROM transport_routes ORDER BY passengers_waiting DESC").all();
  if (transport[0] && transport[0].passengers_waiting > 200) {
    recommendations.push({
      priority: "medium",
      route: transport[0].route,
      message: `Route ${transport[0].route} has ${transport[0].passengers_waiting} waiting. Deploy extra buses.`,
      action: "add_transport"
    });
  }

  return { gates, recommendations };
}

module.exports = { getStadiumData, crowdLevelFromCount, getCrowdRecommendations };
