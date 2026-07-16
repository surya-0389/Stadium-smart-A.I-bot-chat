// Stadium knowledge base — used by the AI assistant
const STADIUM = {
  name: "Narendra Modi Stadium",
  capacity: 132000,
  gates: [
    { id: "A", name: "Gate A — North", crowd: "low",    nearest: ["Section 101-120", "Food Court 1"] },
    { id: "B", name: "Gate B — East",  crowd: "medium", nearest: ["Section 201-220", "Food Court 2"] },
    { id: "C", name: "Gate C — South", crowd: "high",   nearest: ["Section 301-320", "Ticket Counter"] },
    { id: "D", name: "Gate D — West",  crowd: "low",    nearest: ["Section 401-420", "VIP Lounge"] }
  ],
  sections: {
    "101": { block: "North Lower",  gate: "A", rowGuide: "Rows 1-30 run left to right. Aisle 15 is centre." },
    "102": { block: "North Lower",  gate: "A", rowGuide: "Near Gate A — follow blue signs." },
    "201": { block: "East Stand",   gate: "B", rowGuide: "Upper tier — use escalator near Gate B." },
    "301": { block: "South Stand",  gate: "C", rowGuide: "Main stand — giant screen behind you." },
    "401": { block: "West Pavilion", gate: "D", rowGuide: "Pavilion end — premium seating zone." }
  },
  foodCounters: [
    { name: "Food Court 1", location: "Gate A, Level 1", items: "Pizza, Burgers, Soft drinks", wait: "5 min" },
    { name: "Food Court 2", location: "Gate B, Level 2", items: "Indian thali, Chaat, Lassi", wait: "8 min" },
    { name: "Snack Kiosk 3", location: "Section 201 corridor", items: "Popcorn, Nachos, Coffee", wait: "3 min" },
    { name: "Halal Corner", location: "Gate C, Level 1", items: "Biryani, Kebabs, Juice", wait: "12 min" }
  ],
  ticketCounters: [
    { name: "Main Ticket Counter", location: "Gate C entrance", hours: "2 hrs before match" },
    { name: "Will-Call / Reprint", location: "Gate A, booth 2", hours: "Match day only" }
  ],
  transport: {
    buses: [
      { route: "B-42", destination: "Ahmedabad Railway Station", frequency: "Every 8 min", stop: "Gate C parking" },
      { route: "B-17", destination: "Sabarmati Metro", frequency: "Every 10 min", stop: "Gate A exit" },
      { route: "B-99", destination: "Airport Road", frequency: "Every 15 min", stop: "Gate D" }
    ],
    metro: { station: "Motera Metro", walk: "12 min from Gate B", lastTrain: "11:30 PM" },
    rideshare: { pickup: "Gate D rideshare zone", tip: "Use exit D to avoid Gate C crowd" }
  },
  restrooms: [
    { location: "Every 50 metres on concourse", accessible: true },
    { location: "Gate B Level 1 — family room", accessible: true }
  ],
  firstAid: { location: "Gate C, Room 12", phone: "108" }
};
