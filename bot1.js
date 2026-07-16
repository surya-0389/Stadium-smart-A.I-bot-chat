/* Stadium AI Assistant — Frontend (connects to backend API) */

let currentLang = "en";
let chatSessionId = localStorage.getItem("chat_session_id") || null;

const UI = {
  en: { placeholder: "Ask anything — seat, food, gate, bus...", thinking: "Thinking...", quickFindSeat: "Find my seat", quickFood: "Food counter", quickGate: "Nearest gate", quickBus: "Bus / Metro", quickRestroom: "Restroom", quickHelp: "Emergency", myTicket: "My tickets" },
  hi: { placeholder: "Kuch bhi poochho — seat, khana, gate, bus...", thinking: "Soch raha hoon...", quickFindSeat: "Meri seat kahan hai", quickFood: "Khana kahan milega", quickGate: "Sabse najdeek gate", quickBus: "Bus / Metro", quickRestroom: "Restroom", quickHelp: "Emergency", myTicket: "Mere tickets" },
  hinglish: { placeholder: "Kuch bhi poocho...", thinking: "Thinking...", quickFindSeat: "Seat kahan hai", quickFood: "Food counter", quickGate: "Nearest gate", quickBus: "Bus / Metro", quickRestroom: "Restroom", quickHelp: "Emergency", myTicket: "My tickets" },
  ta: { placeholder: "எதையும் கேளுங்கள்...", thinking: "யோசிக்கிறேன்...", quickFindSeat: "என் இருக்கை", quickFood: "உணவு", quickGate: "கேட்", quickBus: "பேருந்து", quickRestroom: "கழிப்பறை", quickHelp: "அவசரம்", myTicket: "டிக்கெட்" },
  bn: { placeholder: "যেকোনো কিছু জিজ্ঞাসা করুন...", thinking: "ভাবছি...", quickFindSeat: "আমার আসন", quickFood: "খাবার", quickGate: "গেট", quickBus: "বাস", quickRestroom: "টয়লেট", quickHelp: "জরুরি", myTicket: "টিকিট" }
};

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function appendMessage(html, cls) {
  const chat = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.className = cls;
  div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function setLang(lang) {
  currentLang = lang;
  const ui = UI[lang] || UI.en;
  document.getElementById("userInput").placeholder = ui.placeholder;
  const keys = ["quickFindSeat", "quickFood", "quickGate", "quickBus", "quickRestroom", "quickHelp", "myTicket"];
  document.querySelectorAll(".quick-btn").forEach((btn, i) => {
    if (ui[keys[i]]) btn.textContent = btn.dataset.emoji + " " + ui[keys[i]];
  });
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

async function sendMessage(prefill) {
  const input = document.getElementById("userInput");
  const text = (prefill || input.value).trim();
  if (!text) return;

  appendMessage(escapeHtml(text), "user");
  input.value = "";

  const ui = UI[currentLang] || UI.en;
  const thinkingEl = appendMessage(ui.thinking, "bot thinking");

  try {
    const data = await Api.sendChat(text, chatSessionId, currentLang);
    chatSessionId = data.sessionId;
    localStorage.setItem("chat_session_id", chatSessionId);

    if (data.language && data.language !== currentLang) setLang(data.language);

    thinkingEl.classList.remove("thinking");
    thinkingEl.innerHTML = data.reply;
  } catch (err) {
    thinkingEl.classList.remove("thinking");
    thinkingEl.innerHTML = `⚠️ Server error: ${escapeHtml(err.message)}<br><br>Make sure backend is running:<br><code>cd backend && npm start</code>`;
  }

  document.getElementById("chatBox").scrollTop = document.getElementById("chatBox").scrollHeight;
}

function initBot() {
  const user = Api.getUser();
  if (!user) {
    window.location.href = "tourist login.html";
    return;
  }

  const badge = document.getElementById("userBadge");
  if (badge) badge.textContent = `${user.name} (${user.role})`;

  const ui = UI[currentLang];
  document.getElementById("userInput").placeholder = ui.placeholder;

  document.getElementById("userInput").addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setLang(btn.dataset.lang);
      sendMessage(btn.dataset.lang === "hi" ? "Namaste" : "Hello");
    });
  });

  document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", () => sendMessage(btn.dataset.query));
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    Api.clearSession();
    window.location.href = "p3-2.html";
  });
}

document.addEventListener("DOMContentLoaded", initBot);
