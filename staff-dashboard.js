const user = Api.getUser();
if (!user || user.role !== "staff") {
  window.location.href = "staff login.html";
}

document.getElementById("staffName").textContent = `${user.name} · Live Crowd Monitor`;
document.getElementById("logoutBtn").onclick = () => {
  Api.clearSession();
  window.location.href = "p3-2.html";
};

function crowdClass(level) {
  return level === "high" ? "high" : level === "medium" ? "medium" : "low";
}

async function loadData() {
  try {
    const data = await Api.getCrowdStatus();
    renderGates(data.gates);
    renderRecommendations(data.recommendations);
    populateGateSelect(data.gates);
  } catch (e) {
    alert("Failed to load: " + e.message + "\nRun: cd backend && npm start");
  }
}

function renderGates(gates) {
  document.getElementById("gateCards").innerHTML = gates.map(g => `
    <div class="gate-card ${crowdClass(g.crowd_level)}">
      <h3>${g.name}</h3>
      <div class="count">${g.people_count.toLocaleString()}</div>
      <div class="level">${g.crowd_level} crowd</div>
    </div>
  `).join("");
}

function renderRecommendations(recs) {
  const el = document.getElementById("recommendations");
  if (!recs || recs.length === 0) {
    el.innerHTML = '<div class="rec-item">✅ All gates operating normally.</div>';
    return;
  }
  el.innerHTML = recs.map(r => `
    <div class="rec-item ${r.priority}">
      <strong>${r.action.replace(/_/g, " ").toUpperCase()}</strong><br>${r.message}
    </div>
  `).join("");
}

function populateGateSelect(gates) {
  const sel = document.getElementById("gateSelect");
  sel.innerHTML = gates.map(g =>
    `<option value="${g.id}">${g.id} — ${g.name} (${g.people_count})</option>`
  ).join("");
}

document.getElementById("updateForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("formMsg");
  msg.textContent = "Updating...";
  try {
    const gateId = document.getElementById("gateSelect").value;
    const peopleCount = Number(document.getElementById("peopleCount").value);
    const crowdLevel = document.getElementById("crowdLevel").value;
    const note = document.getElementById("note").value;
    await Api.updateGate(gateId, peopleCount, crowdLevel, note);
    msg.textContent = "✅ Gate updated! Fans will see live data in AI chat.";
    document.getElementById("peopleCount").value = "";
    document.getElementById("note").value = "";
    loadData();
  } catch (err) {
    msg.textContent = "❌ " + err.message;
    msg.style.color = "#f87171";
  }
});

loadData();
setInterval(loadData, 30000);
