/* ============================================================
   ⚙️ НАСТРОЙКИ — МЕНЯЙ ЗДЕСЬ
   ------------------------------------------------------------
   1) Узнай свой username в Telegram: открой Telegram →
      Настройки → имя пользователя (например @ivan_igraet).
   2) Впиши ссылку ниже БЕЗ символа @:
        https://t.me/ivan_igraet
   3) TELEGRAM_TEXT — текст, который подставится в сообщение.
      Если твой клиент Telegram не подхватывает текст из
      ссылки, просто удали параметр — сообщение можно
      написать вручную после открытия чата.
   ============================================================ */
const CONFIG = {
  TELEGRAM_URL: "https://t.me/mepkon",
  TELEGRAM_TEXT: "Йо! Я готов(а) катать в Brawl Stars! ⚔️ Давай в лобби, тиммейт ждёт.",
};

/* ============ ДАННЫЕ АНКЕТЫ ============ */
const QUIZ = [
  {
    q: "Готовы ли вы к эпическим поражениям?",
    opts: ["Конечно! Поражения закаляют", "Только если мы хотя бы раз выиграем", "Я тут ради побед, честно"],
  },
  {
    q: "Сколько каток готовы сыграть?",
    opts: ["5–10, и хватит", "Каток 20, не меньше", "Пока не устану (это долго)"],
  },
  {
    q: "Как вы относитесь к случайным тиммейтам?",
    opts: ["Люблю хаос в команде", "Норм, если не токсики", "Молюсь, чтобы попался нормальный"],
  },
  {
    q: "Готовы разделить радость победы и боль поражения?",
    opts: ["Разделим пополам 50/50", "Победы — вместе, поражения — тоже вместе", "Боль оставьте мне"],
  },
];

const TAUNTS = [
  "Не так быстро!",
  "Вы уверены в своём решении?",
  "Подумайте ещё раз 🥺",
  "Ваш тиммейт уже ждёт...",
  "Ошибка: отказ не найден",
  "Каток сам себя не сыграет",
  "Легенды не сдаются с первого раза",
];

/* ============ УТИЛИТЫ ============ */
const $ = (sel) => document.querySelector(sel);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const screenEls = document.querySelectorAll(".screen");
const screen3 = document.querySelector('.screen[data-screen="3"]');

function showScreen(n) {
  screenEls.forEach((s) => {
    s.classList.toggle("active", s.dataset.screen === String(n));
  });
  btnNo.classList.toggle("visible", n === 3); // «НЕТ» существует только на 3-м экране
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

/* ============ ЭКРАН 1 ============ */
$("#btn-next-1").addEventListener("click", () => showScreen(2));

/* ============ ЭКРАН 2: АНКЕТА ============ */
const quizEl = $("#quiz");
const answers = new Array(QUIZ.length).fill(null);

QUIZ.forEach((item, qi) => {
  const card = document.createElement("div");
  card.className = "quiz-q";

  const title = document.createElement("h3");
  title.textContent = `${qi + 1}. ${item.q}`;
  card.appendChild(title);

  const opts = document.createElement("div");
  opts.className = "quiz-opts";

  item.opts.forEach((text, oi) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt";
    btn.type = "button";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      opts.querySelectorAll(".quiz-opt").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      answers[qi] = oi;
      checkQuizDone();
    });
    opts.appendChild(btn);
  });

  card.appendChild(opts);
  quizEl.appendChild(card);
});

const btnQuizNext = $("#btn-quiz-next");
function checkQuizDone() {
  const done = answers.every((a) => a !== null);
  btnQuizNext.disabled = !done;
}

$("#btn-skip").addEventListener("click", () => showScreen(3));
btnQuizNext.addEventListener("click", () => showScreen(3));

/* ============ ЭКРАН 3: УБЕГАЮЩАЯ КНОПКА ============ */
const btnYes = $("#btn-yes");
const btnNo = $("#btn-no");
const taunt = $("#no-taunt");

let noSize = null;
let tauntTimer = null;

function ensureNoSize() {
  if (!noSize || noSize.w === 0) {
    const r = btnNo.getBoundingClientRect();
    noSize = { w: r.width || btnNo.offsetWidth, h: r.height || btnNo.offsetHeight };
  }
}

// случайная позиция ЦЕНТРА кнопки в пределах всего экрана (viewport)
function randomPos() {
  const margin = 14;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const hw = noSize.w / 2;
  const hh = noSize.h / 2;

  const minX = margin + hw;
  const maxX = Math.max(minX, vw - margin - hw);
  const minY = margin + hh;
  const maxY = Math.max(minY, vh - margin - hh);

  // «поле страха» вокруг кнопки «ДА» — «НЕТ» не должна её перекрывать
  const yes = btnYes.getBoundingClientRect();
  const pad = 20;
  const blocked = {
    x: yes.left - pad, y: yes.top - pad,
    w: yes.width + pad * 2, h: yes.height + pad * 2,
  };
  const overlaps = (cx, cy) =>
    cx - hw < blocked.x + blocked.w && cx + hw > blocked.x &&
    cy - hh < blocked.y + blocked.h && cy + hh > blocked.y;

  let fallback = null;
  for (let i = 0; i < 30; i++) {
    const cx = minX + Math.random() * (maxX - minX);
    const cy = minY + Math.random() * (maxY - minY);
    if (!overlaps(cx, cy)) return { cx, cy };
    if (!fallback) fallback = { cx, cy };
  }
  return fallback;
}

function showTaunt() {
  taunt.textContent = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
  taunt.classList.remove("show");
  void taunt.offsetWidth; // перезапуск анимации
  taunt.classList.add("show");
  clearTimeout(tauntTimer);
  tauntTimer = setTimeout(() => taunt.classList.remove("show"), 1400);
}

function flee(clientX, clientY) {
  ensureNoSize();
  // убегаем только если указатель реально рядом/на кнопке
  if (clientX !== undefined) {
    const r = btnNo.getBoundingClientRect();
    const pad = 60; // «поле страха» вокруг кнопки
    const near =
      clientX > r.left - pad && clientX < r.right + pad &&
      clientY > r.top - pad && clientY < r.bottom + pad;
    if (!near) return;
  }
  const p = randomPos();
  // left/top — координаты ЦЕНТРА кнопки (transform: translate(-50%,-50%))
  btnNo.style.left = p.cx + "px";
  btnNo.style.top = p.cy + "px";
  btnNo.classList.add("fleeing");
  showTaunt();
}

// мышь: уводим при приближении курсора
if (!reduceMotion) {
  document.addEventListener("pointermove", (e) => {
    if (!screen3.classList.contains("active")) return;
    flee(e.clientX, e.clientY);
  }, { passive: true });
}

// клик/тап по «НЕТ» — перехватываем и убегаем
document.addEventListener("pointerdown", (e) => {
  if (!screen3.classList.contains("active")) return;
  const r = btnNo.getBoundingClientRect();
  const hit =
    e.clientX > r.left - 30 && e.clientX < r.right + 30 &&
    e.clientY > r.top - 30 && e.clientY < r.bottom + 30;
  if (hit) {
    e.preventDefault();
    e.stopPropagation();
    flee(e.clientX, e.clientY);
  }
}, { capture: true });

// страховка: «НЕТ» никогда не должна срабатывать как кнопка
btnNo.addEventListener("click", (e) => e.preventDefault());

// страховка: при resize сбрасываем позицию
window.addEventListener("resize", () => {
  noSize = null;
  btnNo.style.left = "";
  btnNo.style.top = "";
});

/* ============ КОНФЕТТИ (лёгкий canvas) ============ */
const canvas = $("#confetti");
const ctx = canvas.getContext("2d");
const COLORS = ["#ffd93d", "#7b5cff", "#ff8c42", "#3aa0ff", "#ff4d6d", "#37d353"];
let particles = [];
let confettiRunning = false;

function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
sizeCanvas();
window.addEventListener("resize", sizeCanvas);

function burst() {
  if (reduceMotion) return;
  sizeCanvas();
  particles = [];
  const count = Math.min(160, Math.floor(innerWidth / 8));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.5,
      y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -(Math.random() * 12 + 5),
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[i % COLORS.length],
      life: 1,
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(confettiLoop);
  }
}

function confettiLoop() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  let alive = false;
  for (const p of particles) {
    p.vy += 0.28;               // гравитация
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y < innerHeight + 30 && p.life > 0) alive = true;
    if (p.life <= 0) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  if (alive) {
    requestAnimationFrame(confettiLoop);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
}

/* ============ ЭКРАН 4: ДА! ============ */
btnYes.addEventListener("click", () => {
  burst();
  showScreen(4);
});

/* ============ TELEGRAM ============ */
$("#btn-telegram").addEventListener("click", () => {
  let url = CONFIG.TELEGRAM_URL.trim();
  const text = (CONFIG.TELEGRAM_TEXT || "").trim();
  if (text) {
    url += (url.includes("?") ? "&" : "?") + "text=" + encodeURIComponent(text);
  }
  window.open(url, "_blank", "noopener");
});
