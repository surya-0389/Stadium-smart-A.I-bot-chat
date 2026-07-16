const { getStadiumData } = require("./stadiumService");

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function detectLanguage(text) {
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  const t = text.toLowerCase();
  const hinglishWords = ["kahan", "kaha", "kaise", "mera", "meri", "hai", "batao", "bata", "khana", "gate", "seat", "milega", "chahiye", "janna", "madad"];
  if (hinglishWords.some((w) => t.includes(w))) return "hinglish";
  return "en";
}

function detectIntent(text) {
  const t = text.toLowerCase();
  const patterns = {
    seat: /seat|section|row|block|सीट|இருக்கை|আসন|baithna|bethna|kahan baith|where.*sit/i,
    food: /food|eat|hungry|khana|खाना|snack|pizza|biryani|counter|खाने|உணவு|খাবার|thali|drink|pani|पानी/i,
    gate: /gate|entrance|exit|प्रवेश|द्वार|கேட்|গেট|andar|andhar|bahar|nikalna|leave/i,
    ticket: /ticket|pass|reprint|will.?call|टिकट|टिकेट/i,
    transport: /bus|train|metro|transport|ride|uber|ola|auto|परिवहन|बस|रेल|பேருந்து|বাস|station|ghar|home|nikal/i,
    restroom: /restroom|toilet|washroom|bathroom|शौचालय|टॉयलेट|கழிப்பறை|টয়লেট/i,
    crowd: /crowd|bheed|भीड|rush|busy|wait|line|queue/i,
    help: /help|emergency|first.?aid|medical|ambulance|मदद|आपात|உதவி|সাহায্য|108|police/i,
    greet: /^(hi|hello|hey|namaste|namaskar|vanakkam|nomoshkar|salam|hola)\b/i,
    myticket: /my ticket|mera ticket|meri seat|my seat|booking/i
  };

  for (const [intent, regex] of Object.entries(patterns)) {
    if (regex.test(t)) return intent;
  }
  return "general";
}

function parseSeatInfo(text) {
  const section = text.match(/section\s*([a-z]?\d{2,3})/i) || text.match(/block\s*([a-z]?\d{2,3})/i);
  const row = text.match(/row\s*(\d{1,2})/i);
  const seat = text.match(/seat\s*(\d{1,3})/i);
  const nums = text.match(/\b(\d{3})\b/);
  return {
    section: section ? section[1].replace(/[^0-9]/g, "") || section[1] : nums ? nums[1] : null,
    row: row ? row[1] : null,
    seat: seat ? seat[1] : null
  };
}

function processMessage(text, lang, userTickets) {
  const STADIUM = getStadiumData();
  const detectedLang = lang || detectLanguage(text);
  const intent = detectIntent(text);
  const reply = generateReply(intent, text, detectedLang, STADIUM, userTickets);

  return { reply, intent, language: detectedLang };
}

function generateReply(intent, text, L, STADIUM, userTickets) {
  const info = parseSeatInfo(text);
  const handlers = {
    seat: () => seatResponse(info, L, STADIUM),
    food: () => foodResponse(L, STADIUM),
    gate: () => gateResponse(L, STADIUM),
    ticket: () => ticketResponse(L, STADIUM),
    transport: () => transportResponse(L, STADIUM),
    restroom: () => restroomResponse(L, STADIUM),
    crowd: () => gateResponse(L, STADIUM),
    help: () => helpResponse(L, STADIUM),
    greet: () => greetResponse(L),
    myticket: () => myTicketResponse(L, userTickets, STADIUM),
    general: () => generalResponse(text, L)
  };
  return (handlers[intent] || handlers.general)();
}

function seatResponse(info, L, STADIUM) {
  const secKey = info.section
    ? Object.keys(STADIUM.sections).find((k) => k === info.section || info.section.includes(k))
    : null;
  const sec = secKey ? STADIUM.sections[secKey] : null;

  if (sec) {
    const gate = STADIUM.gates.find((g) => g.id === sec.gate);
    const crowdNote = gate.crowd === "high" ? " (crowded — consider Gate D alternate)" : " (less crowded right now)";
    const msgs = {
      en: `📍 <b>Seat Navigation</b><br><br><b>Section ${secKey}</b> — ${sec.block}<br>${info.row ? `Row <b>${info.row}</b>` : ""}${info.seat ? ` · Seat <b>${info.seat}</b>` : ""}<br><br>🚪 Enter via <b>${gate.name}</b>${crowdNote}<br>👥 Live count: ${gate.peopleCount} people<br>🧭 ${sec.rowGuide}`,
      hi: `📍 <b>Seat ka rasta</b><br><br><b>Section ${secKey}</b> — ${sec.block}<br>${info.row ? `Row <b>${info.row}</b>` : ""}${info.seat ? ` · Seat <b>${info.seat}</b>` : ""}<br><br>🚪 <b>${gate.name}</b> se andar aaiye<br>👥 Abhi ${gate.peopleCount} log hain<br>🧭 ${sec.rowGuide}`,
      hinglish: `📍 Section <b>${secKey}</b> (${sec.block})<br>👉 <b>${gate.name}</b> se enter karo — ${gate.peopleCount} people abhi`,
      ta: `📍 பிரிவு <b>${secKey}</b> — ${sec.block}<br>🚪 ${gate.name}`,
      bn: `📍 সেকশন <b>${secKey}</b> — ${sec.block}<br>🚪 ${gate.name}`
    };
    return msgs[L] || msgs.en;
  }

  const ask = {
    en: `🪑 <b>Find Your Seat</b><br><br>Tell me: "Section 201 Row 14 Seat 8"<br>Sections: <b>101, 102, 201, 301, 401</b>`,
    hi: `🪑 Apni seat batayein — jaise "Section 201 Row 14 Seat 8"`,
    hinglish: `🪑 Seat details do — "Section 201 Row 14 Seat 8"`,
    ta: `🪑 இருக்கை விவரம் சொல்லுங்கள்`,
    bn: `🪑 আসনের তথ্য দিন`
  };
  return ask[L] || ask.en;
}

function myTicketResponse(L, tickets, STADIUM) {
  if (!tickets || tickets.length === 0) {
    const msgs = {
      en: "🎫 No tickets linked to your account. Login as <b>fan1</b> to see demo tickets.",
      hi: "🎫 Aapke account par koi ticket nahi hai. Demo ke liye <b>fan1</b> se login karein."
    };
    return msgs[L] || msgs.en;
  }

  const list = tickets.map((t) => {
    const sec = STADIUM.sections[t.section];
    const gate = sec ? STADIUM.gates.find((g) => g.id === sec.gate) : null;
    return `🎫 <b>${t.match_name}</b><br>Section <b>${t.section}</b> · Row ${t.row_num} · Seat ${t.seat_num}<br>${gate ? `🚪 Use ${gate.name}` : ""}`;
  }).join("<br><br>");

  return (L === "hi" ? "🎫 <b>Aapke tickets:</b><br><br>" : "🎫 <b>Your tickets:</b><br><br>") + list;
}

function foodResponse(L, STADIUM) {
  const list = STADIUM.foodCounters.map((f) =>
    `🍔 <b>${f.name}</b><br>   📍 ${f.location}<br>   ${f.items} · Wait ~${f.wait}`
  ).join("<br><br>");
  return `🍽️ <b>Food Counters</b><br><br>${list}`;
}

function gateResponse(L, STADIUM) {
  const sorted = [...STADIUM.gates].sort((a, b) => a.peopleCount - b.peopleCount);
  const best = sorted[0];
  const list = STADIUM.gates.map((g) => {
    const icon = g.crowd === "low" ? "🟢" : g.crowd === "medium" ? "🟡" : "🔴";
    return `${icon} <b>${g.name}</b> — ${g.peopleCount} people (${g.crowd})`;
  }).join("<br>");

  return `🚪 <b>Gate Status (Live from Server)</b><br><br>${list}<br><br>✅ <b>Recommended:</b> ${best.name}`;
}

function ticketResponse(L, STADIUM) {
  const list = STADIUM.ticketCounters.map((t) =>
    `🎫 <b>${t.name}</b><br>   📍 ${t.location} · ${t.hours}`
  ).join("<br><br>");
  return `🎫 <b>Ticket Counters</b><br><br>${list}`;
}

function transportResponse(L, STADIUM) {
  const buses = STADIUM.transport.buses.map((b) =>
    `🚌 Route <b>${b.route}</b> → ${b.destination}<br>   ${b.frequency} · Stop: ${b.stop}<br>   ⏳ ${b.passengersWaiting} waiting · Capacity ${b.capacity}`
  ).join("<br><br>");
  const m = STADIUM.transport.metro;
  return `🚌 <b>Post-Match Transport (Live)</b><br><br>${buses}<br><br>🚇 Metro: <b>${m.station}</b> (${m.walk})`;
}

function restroomResponse(L, STADIUM) {
  const list = STADIUM.restrooms.map((r) => `🚻 ${r.location}`).join("<br>");
  return `🚻 <b>Restrooms</b><br><br>${list}`;
}

function helpResponse(L, STADIUM) {
  const f = STADIUM.firstAid;
  return `🆘 <b>Emergency</b><br>🏥 ${f.location}<br>📞 ${f.phone}`;
}

function greetResponse(L) {
  const msgs = {
    en: "Hello! 👋 I'm your Stadium AI Assistant. Ask about seats, food, gates, or transport!",
    hi: "Namaste! 🙏 Seat, khana, gate ya bus — kuch bhi poochho!",
    hinglish: "Hey! 👋 Seat, food, gate, bus — bol do!"
  };
  return msgs[L] || msgs.en;
}

function generalResponse(text, L) {
  return `I can help with seats, food, gates, transport & tickets.<br>Try: "Section 201 Row 14" or "Khana kahan milega?"`;
}

module.exports = { processMessage, detectLanguage, detectIntent };
