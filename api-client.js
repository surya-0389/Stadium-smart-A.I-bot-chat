const API_BASE = window.location.origin;

const Api = {
  getToken() {
    return localStorage.getItem("stadium_token");
  },

  getUser() {
    const raw = localStorage.getItem("stadium_user");
    return raw ? JSON.parse(raw) : null;
  },

  setSession(token, user) {
    localStorage.setItem("stadium_token", token);
    localStorage.setItem("stadium_user", JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem("stadium_token");
    localStorage.removeItem("stadium_user");
    localStorage.removeItem("chat_session_id");
  },

  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...options.headers };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  },

  login(username, password) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
  },

  register(username, password, name, email) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, name, email })
    });
  },

  sendChat(message, sessionId, language) {
    return this.request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, sessionId, language })
    });
  },

  getCrowdStatus() {
    return this.request("/api/crowd/status");
  },

  updateGate(gateId, peopleCount, crowdLevel, note) {
    return this.request(`/api/crowd/gates/${gateId}`, {
      method: "PUT",
      body: JSON.stringify({ peopleCount, crowdLevel, note })
    });
  },

  getAdminStats() {
    return this.request("/api/admin/stats");
  },

  updateTransport(id, passengersWaiting, capacity) {
    return this.request(`/api/admin/transport/${id}`, {
      method: "PUT",
      body: JSON.stringify({ passengersWaiting, capacity })
    });
  },

  getMyTickets() {
    return this.request("/api/tickets/my");
  }
};

function redirectByRole(role) {
  if (role === "staff") window.location.href = "staff-dashboard.html";
  else if (role === "admin") window.location.href = "admin-dashboard.html";
  else window.location.href = "bot1.html";
}

async function handleLogin(username, password, expectedRole) {
  const { token, user } = await Api.login(username, password);
  if (expectedRole && user.role !== expectedRole) {
    throw new Error(`This login is for ${expectedRole} only. Use the correct portal.`);
  }
  Api.setSession(token, user);
  redirectByRole(user.role);
}
