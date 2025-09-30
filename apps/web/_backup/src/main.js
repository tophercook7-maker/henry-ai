const apiBase =
  localStorage.getItem("__henry_api_base__")?.replace(/\/+$/, "") ||
  "http://127.0.0.1:3000";

const els = {
  thread: document.getElementById("thread"),
  form: document.getElementById("composer-form"),
  input: document.getElementById("composer-input"),
  send: document.getElementById("send-btn"),
  pillModel: document.getElementById("pill-model"),
  pillChars: document.getElementById("pill-chars"),
  pillCost: document.getElementById("pill-cost"),
};

function addBubble(role, text) {
  const row = document.createElement("div");
  row.className = `msg ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);
  els.thread.appendChild(row);
  els.thread.scrollTop = els.thread.scrollHeight;
}

function setBusy(on) {
  els.input.disabled = on;
  els.send.disabled = on;
}

function updateLivePills({ model, chars, cost }) {
  if (model) els.pillModel.textContent = model;
  if (typeof chars === "number") els.pillChars.textContent = String(chars);
  if (typeof cost === "number") els.pillCost.textContent = cost.toFixed(4);
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;
  els.input.value = "";
  sendMessage(text);
});

els.input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    els.form.requestSubmit();
  }
});

async function sendMessage(text) {
  addBubble("user", text);
  setBusy(true);

  try {
    const res = await fetch(`${apiBase}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Chat failed (${res.status}): ${t}`);
    }

    const j = await res.json();
    const reply = j.reply ?? j.content ?? j.message ?? JSON.stringify(j);
    addBubble("assistant", reply);
    updateLivePills({
      model: j.model || j.usage?.model,
      chars: j.usage?.chars ?? j.chars,
      cost: j.usage?.cost ?? j.cost,
    });
  } catch (err) {
    addBubble("assistant", `⚠️ ${err.message ?? err}`);
  } finally {
    setBusy(false);
    els.input.focus();
  }
}

addBubble("assistant", "Howdy — Henry’s here. Enter sends; Shift+Enter = newline.");
