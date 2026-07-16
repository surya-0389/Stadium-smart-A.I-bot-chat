const user = Api.getUser();
if (!user || user.role !== "admin") {
  window.location.href = "administration login.html";
}

document.getElementById("adminName").textContent = `${user.name} · Full System Control`;
document.getElementById("logoutBtn").onclick = () => {
  Api.clearSession();
  window.location.href = "p3-2.html";
};

async function loadStats() {
  try {
    const data = await Api.getAdminStats();
    renderStats(data);
    renderGates(data.gates);
    renderTransport(data.transport);
    renderRecommendations(data.recommendations);
  } catch (e) {
    alert("Failed to load: " + e.message);
  }
}

function renderStats(data) {
  document.getElementById("statsGrid").innerHTML = `
    <div class="stat-card"><div class="num">${data.users}</div><div class="lbl">Total Users</div></div>
    <div class="stat-card"><div class="num">${data.fans}</div><div class="lbl">Fans</div></div>
    <div class="stat-card"><div class="num">${data.tickets}</div><div class="lbl">Tickets</div></div>
    <div class="stat-card"><div class="num">${data.chatMessages}</div><div class="lbl">AI Chats</div></div>
    <div class="stat-card"><div class="num">${(data.totalCrowdInStadium || 0).toLocaleString()}</div><div class="lbl">People in Stadium</div></div>
  `;
}

function renderGates(gates) {
  document.getElementById("gatesTable").innerHTML = `
    <table>
      <tr><th>Gate</th><th>Name</th><th>People</th><th>Level</th><th>Updated</th></tr>
      ${gates.map(g => `
        <tr>
          <td>${g.id}</td>
          <td>${g.name}</td>
          <td>${g.people_count.toLocaleString()}</td>
          <td><span class="badge ${g.crowd_level}">${g.crowd_level}</span></td>
          <td>${g.updated_at || "—"}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

function renderTransport(routes) {
  document.getElementById("transportTable").innerHTML = `
    <table>
      <tr><th>Route</th><th>Destination</th><th>Waiting</th><th>Capacity</th><th>Action</th></tr>
      ${routes.map(r => `
        <tr>
          <td>${r.route}</td>
          <td>${r.destination}</td>
          <td id="wait-${r.id}">${r.passengers_waiting}</td>
          <td>${r.capacity}</td>
          <td>
            <div class="inline-form">
              <input type="number" id="input-${r.id}" placeholder="Waiting" min="0">
              <button onclick="updateRoute(${r.id})">Update</button>
            </div>
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

async function updateRoute(id) {
  const val = Number(document.getElementById(`input-${id}`).value);
  if (isNaN(val)) return alert("Enter a number");
  await Api.updateTransport(id, val, null);
  document.getElementById(`wait-${id}`).textContent = val;
}

function renderRecommendations(recs) {
  const el = document.getElementById("recommendations");
  if (!recs || recs.length === 0) {
    el.innerHTML = '<div class="rec-item">✅ System healthy.</div>';
    return;
  }
  el.innerHTML = recs.map(r => `
    <div class="rec-item ${r.priority}">${r.message}</div>
  `).join("");
}

loadStats();
setInterval(loadStats, 30000);
