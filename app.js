/**
 * Pomodoro Timer
 * Multi-language · Themes · Focus / Short / Long breaks
 */

const SETTINGS_KEY = "pomodoro-settings";
const STATS_KEY = "pomodoro-stats";

// ---------- i18n ----------
const I18N = {
  en: {
    title: "Pomodoro Timer",
    subtitle: "Focus · Short break · Long break",
    labelFocus: "Focus",
    labelShort: "Short Break",
    labelLong: "Long Break",
    labelStart: "Start",
    labelPause: "Pause",
    labelReset: "Reset",
    labelSkip: "Skip",
    labelSessions: "Sessions",
    labelFocusTime: "Focus min",
    labelStreak: "Streak",
    settingsTitle: "Durations (minutes)",
    labelDurFocus: "Focus",
    labelDurShort: "Short",
    labelDurLong: "Long",
    labelLongEvery: "Long every",
    labelAutoStart: "Auto-start next session",
    footer: "Pomodoro Timer · Tonder Tech",
    copyright: "© 2026 Tonder Tech · v1.0 · All rights reserved",
    sessionFocus: "Focus",
    sessionShort: "Short Break",
    sessionLong: "Long Break",
  },
  fa: {
    title: "تایمر پومودورو",
    subtitle: "تمرکز · استراحت کوتاه · استراحت بلند",
    labelFocus: "تمرکز",
    labelShort: "استراحت کوتاه",
    labelLong: "استراحت بلند",
    labelStart: "شروع",
    labelPause: "توقف",
    labelReset: "بازنشانی",
    labelSkip: "رد کردن",
    labelSessions: "جلسات",
    labelFocusTime: "دقیقه تمرکز",
    labelStreak: "رشته",
    settingsTitle: "مدت‌ها (دقیقه)",
    labelDurFocus: "تمرکز",
    labelDurShort: "کوتاه",
    labelDurLong: "بلند",
    labelLongEvery: "بلند هر",
    labelAutoStart: "شروع خودکار جلسه بعدی",
    footer: "تایمر پومودورو · تندر تک",
    copyright: "© ۲۰۲۶ تندر تک · نسخه ۱.۰ · تمامی حقوق محفوظ است",
    sessionFocus: "تمرکز",
    sessionShort: "استراحت کوتاه",
    sessionLong: "استراحت بلند",
  },
  ar: {
    title: "مؤقت بومودورو",
    subtitle: "تركيز · استراحة قصيرة · استراحة طويلة",
    labelFocus: "تركيز",
    labelShort: "استراحة قصيرة",
    labelLong: "استراحة طويلة",
    labelStart: "ابدأ",
    labelPause: "إيقاف",
    labelReset: "إعادة",
    labelSkip: "تخطي",
    labelSessions: "جلسات",
    labelFocusTime: "دقائق تركيز",
    labelStreak: "سلسلة",
    settingsTitle: "المدد (دقائق)",
    labelDurFocus: "تركيز",
    labelDurShort: "قصيرة",
    labelDurLong: "طويلة",
    labelLongEvery: "طويلة كل",
    labelAutoStart: "بدء تلقائي للجلسة التالية",
    footer: "مؤقت بومودورو · تندر تك",
    copyright: "© ٢٠٢٦ تندر تك · الإصدار ١.٠ · جميع الحقوق محفوظة",
    sessionFocus: "تركيز",
    sessionShort: "استراحة قصيرة",
    sessionLong: "استراحة طويلة",
  },
};

const LANGS = [
  { code: "en", label: "EN" },
  { code: "fa", label: "فا" },
  { code: "ar", label: "ع" },
];

const THEMES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "black", label: "Black" },
  { id: "green", label: "Green" },
];

const RTL_LANGS = new Set(["fa", "ar"]);

// ---------- State ----------
let settings = {
  lang: "en",
  theme: "dark",
  durations: { focus: 25, short: 5, long: 15 },
  longEvery: 4,
  autoStart: false,
};

let stats = {
  sessions: 0,
  focusMinutes: 0,
  streak: 0,
  lastDate: null,
};

let mode = "focus"; // focus | short | long
let remaining = 25 * 60;
let total = 25 * 60;
let running = false;
let intervalId = null;
let completedInCycle = 0; // focus sessions since last long break

// ---------- DOM ----------
const $ = (sel) => document.querySelector(sel);
const timeEl = $("#time");
const sessionLabel = $("#session-label");
const ringProgress = $("#ring-progress");
const btnStart = $("#btn-start");
const btnReset = $("#btn-reset");
const btnSkip = $("#btn-skip");
const langSwitcher = $("#lang-switcher");
const themeSwitcher = $("#theme-switcher");
const modeRow = $("#mode-row");
const appEl = document.querySelector(".app");

const CIRCUMFERENCE = 2 * Math.PI * 54; // ≈ 339.292

// ---------- Persistence ----------
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      settings = { ...settings, ...parsed };
      if (parsed.durations) settings.durations = { ...settings.durations, ...parsed.durations };
    }
  } catch (_) {}
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (_) {}
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) stats = { ...stats, ...JSON.parse(raw) };
  } catch (_) {}
}

function saveStats() {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (_) {}
}

// ---------- UI helpers ----------
function t(key) {
  return I18N[settings.lang]?.[key] ?? I18N.en[key] ?? key;
}

function applyI18n() {
  document.documentElement.lang = settings.lang;
  document.documentElement.dir = RTL_LANGS.has(settings.lang) ? "rtl" : "ltr";

  $("#title").textContent = t("title");
  $("#subtitle").textContent = t("subtitle");
  $("#label-focus").textContent = t("labelFocus");
  $("#label-short").textContent = t("labelShort");
  $("#label-long").textContent = t("labelLong");
  $("#label-reset").textContent = t("labelReset");
  $("#label-skip").textContent = t("labelSkip");
  $("#label-sessions").textContent = t("labelSessions");
  $("#label-focus-time").textContent = t("labelFocusTime");
  $("#label-streak").textContent = t("labelStreak");
  $("#settings-title").textContent = t("settingsTitle");
  $("#label-dur-focus").textContent = t("labelDurFocus");
  $("#label-dur-short").textContent = t("labelDurShort");
  $("#label-dur-long").textContent = t("labelDurLong");
  $("#label-long-every").textContent = t("labelLongEvery");
  $("#label-auto-start").textContent = t("labelAutoStart");
  $("#footer-text").textContent = t("footer");
  $("#copyright-text").textContent = t("copyright");

  updateStartButton();
  updateSessionLabel();
  document.title = t("title");
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", settings.theme);
}

function renderLangSwitcher() {
  langSwitcher.innerHTML = "";
  LANGS.forEach(({ code, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.classList.toggle("active", code === settings.lang);
    btn.addEventListener("click", () => {
      settings.lang = code;
      saveSettings();
      applyI18n();
      renderLangSwitcher();
    });
    langSwitcher.appendChild(btn);
  });
}

function renderThemeSwitcher() {
  themeSwitcher.innerHTML = "";
  THEMES.forEach(({ id, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.classList.toggle("active", id === settings.theme);
    btn.addEventListener("click", () => {
      settings.theme = id;
      saveSettings();
      applyTheme();
      renderThemeSwitcher();
    });
    themeSwitcher.appendChild(btn);
  });
}

function updateStartButton() {
  const span = $("#label-start");
  span.textContent = running ? t("labelPause") : t("labelStart");
}

function updateSessionLabel() {
  const map = {
    focus: "sessionFocus",
    short: "sessionShort",
    long: "sessionLong",
  };
  sessionLabel.textContent = t(map[mode]);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateDisplay() {
  timeEl.textContent = formatTime(remaining);
  const progress = total > 0 ? remaining / total : 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  ringProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
  ringProgress.style.strokeDashoffset = `${offset}`;
  appEl.classList.toggle("running", running);
}

function updateStatsUI() {
  $("#stat-sessions").textContent = stats.sessions;
  $("#stat-focus").textContent = stats.focusMinutes;
  $("#stat-streak").textContent = stats.streak;
}

function syncSettingsInputs() {
  $("#dur-focus").value = settings.durations.focus;
  $("#dur-short").value = settings.durations.short;
  $("#dur-long").value = settings.durations.long;
  $("#long-every").value = settings.longEvery;
  $("#auto-start").checked = settings.autoStart;
}

// ---------- Timer logic ----------
function getDurationForMode(m) {
  if (m === "focus") return settings.durations.focus * 60;
  if (m === "short") return settings.durations.short * 60;
  return settings.durations.long * 60;
}

function setMode(newMode, resetTime = true) {
  mode = newMode;
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  if (resetTime) {
    total = getDurationForMode(mode);
    remaining = total;
  }
  updateSessionLabel();
  updateDisplay();
}

function tick() {
  if (remaining <= 0) {
    completeSession();
    return;
  }
  remaining -= 1;
  updateDisplay();
}

function startTimer() {
  if (running) return;
  running = true;
  updateStartButton();
  intervalId = setInterval(tick, 1000);
  updateDisplay();
}

function pauseTimer() {
  running = false;
  updateStartButton();
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  updateDisplay();
}

function toggleTimer() {
  if (running) pauseTimer();
  else startTimer();
}

function resetTimer() {
  pauseTimer();
  total = getDurationForMode(mode);
  remaining = total;
  updateDisplay();
}

function skipSession() {
  pauseTimer();
  completeSession(true);
}

function completeSession(skipped = false) {
  pauseTimer();

  if (!skipped && mode === "focus") {
    stats.sessions += 1;
    stats.focusMinutes += settings.durations.focus;
    updateStreak();
    completedInCycle += 1;
    saveStats();
    updateStatsUI();
  }

  // Decide next mode
  let next = "focus";
  if (mode === "focus") {
    if (completedInCycle >= settings.longEvery) {
      next = "long";
      completedInCycle = 0;
    } else {
      next = "short";
    }
  } else {
    next = "focus";
  }

  setMode(next);

  // Notification / sound
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(t("title"), {
        body: `${t(mode === "focus" ? "sessionFocus" : mode === "short" ? "sessionShort" : "sessionLong")} → ${t(next === "focus" ? "sessionFocus" : next === "short" ? "sessionShort" : "sessionLong")}`,
      });
    }
  } catch (_) {}

  // Beep
  playBeep();

  if (settings.autoStart) {
    setTimeout(() => startTimer(), 600);
  }
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (stats.lastDate === today) {
    // already counted today
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    if (stats.lastDate === yStr) {
      stats.streak += 1;
    } else {
      stats.streak = 1;
    }
    stats.lastDate = today;
  }
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.1;
    osc.start();
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 180);
  } catch (_) {}
}

// ---------- Event listeners ----------
function bindEvents() {
  btnStart.addEventListener("click", toggleTimer);
  btnReset.addEventListener("click", resetTimer);
  btnSkip.addEventListener("click", skipSession);

  modeRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".mode-btn");
    if (!btn) return;
    pauseTimer();
    setMode(btn.dataset.mode);
  });

  // Duration inputs
  ["dur-focus", "dur-short", "dur-long"].forEach((id) => {
    const el = $(`#${id}`);
    el.addEventListener("change", () => {
      const key = id.replace("dur-", "");
      let val = parseInt(el.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (key === "focus" && val > 90) val = 90;
      if (key === "short" && val > 30) val = 30;
      if (key === "long" && val > 60) val = 60;
      el.value = val;
      settings.durations[key] = val;
      saveSettings();
      if (mode === key && !running) {
        total = val * 60;
        remaining = total;
        updateDisplay();
      }
    });
  });

  $("#long-every").addEventListener("change", (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 2) val = 2;
    if (val > 10) val = 10;
    e.target.value = val;
    settings.longEvery = val;
    saveSettings();
  });

  $("#auto-start").addEventListener("change", (e) => {
    settings.autoStart = e.target.checked;
    saveSettings();
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select")) return;
    if (e.code === "Space") {
      e.preventDefault();
      toggleTimer();
    } else if (e.code === "KeyR") {
      resetTimer();
    } else if (e.code === "KeyS") {
      skipSession();
    }
  });

  // Request notification permission on first interaction
  document.body.addEventListener(
    "click",
    () => {
      if (typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    },
    { once: true }
  );
}

// ---------- Init ----------
function init() {
  loadSettings();
  loadStats();
  applyTheme();
  applyI18n();
  renderLangSwitcher();
  renderThemeSwitcher();
  syncSettingsInputs();
  updateStatsUI();

  total = getDurationForMode(mode);
  remaining = total;
  updateDisplay();
  bindEvents();

  // Service worker for offline / PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

init();
