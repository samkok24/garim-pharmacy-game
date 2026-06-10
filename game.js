/* ============================================
   가림약국 키우기 — 게임 로직
   ============================================ */

"use strict";

/* ---------- 유틸 ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function fmt(n) {
  if (n < 1000) return Math.floor(n).toString();
  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  let u = 0;
  while (n >= 1000 && u < units.length - 1) { n /= 1000; u++; }
  return (n >= 100 ? Math.floor(n) : n.toFixed(1).replace(/\.0$/, "")) + units[u];
}

const ORIGINAL_FREE_EPISODES = [
  { no: 1, url: "https://www.likenovel.net/viewer/20483?productId=1102" },
  { no: 2, url: "https://www.likenovel.net/viewer/20484?productId=1102" },
  { no: 3, url: "https://www.likenovel.net/viewer/20485?productId=1102" },
  { no: 4, url: "https://www.likenovel.net/viewer/20486?productId=1102" },
  { no: 5, url: "https://www.likenovel.net/viewer/20487?productId=1102" },
];

const CUSTOMER_MOODS = [
  { id: "happy", emoji: "😊", label: "안심" },
  { id: "worried", emoji: "😰", label: "불안", bonus: "care" },
  { id: "rush", emoji: "⏰", label: "급함" },
  { id: "angry", emoji: "😡", label: "진상", bonus: "calm" },
  { id: "gift", emoji: "🎁", label: "선물", bonus: "gift" },
  { id: "clue", emoji: "🕵️", label: "단서", bonus: "clue" },
];

const SPECIAL_MOOD = { id: "clue", emoji: "🕵️", label: "수상" };

const STAFF_CAMEOS = {
  miso: {
    role: "전산보조",
    line: "처방전 접수 확인했습니다. 대기 흐름 정리할게요.",
    effect: "전산 정리 · 명성 +",
    side: "left",
    rep: 5,
  },
  junghwa: {
    role: "시니어 약사",
    line: "검수는 제가 한번 더 볼게요. 임 약사, 투약구 부탁해요.",
    effect: "이중 검수 · 골드 +",
    side: "right",
    gold: 5,
  },
  ari: {
    role: "약사",
    line: "복약지도 몰리면 제가 옆에서 받겠슴다!",
    effect: "현장 지원 · 명성 +",
    side: "right",
    rep: 4,
  },
  yesol: {
    role: "조제보조",
    line: "저 방금 수상한 약봉투 봤어요. 확인해볼게요!",
    effect: "단서 제보 · 명성 +",
    side: "left",
    rep: 6,
  },
  hyunil: {
    role: "약사",
    line: "두 번 안 물어봐유. 제가 뒤쪽 조제 잡을게유.",
    effect: "조제 지원 · 골드 +",
    side: "right",
    gold: 6,
  },
  sujin: {
    role: "약사",
    line: "가능. 수상한 처방전만 골라낼게요.",
    effect: "눈썰미 · 명성 +",
    side: "left",
    rep: 7,
  },
};

/* ---------- 상태 ---------- */
const DEFAULT_STATE = () => ({
  gold: 0,
  rep: 0,            // 현재 회차 명성
  lifetimeRep: 0,    // 누적 명성 (회귀 게이지)
  shards: 0,         // 오로라 조각
  regressions: 0,    // 회귀 횟수
  psy: 0, rel: 0, tech: 0,
  upgrades: {},      // id -> lv
  staff: {},         // id -> lv
  skills: {},        // id -> lv
  clearedEvents: [], // event id
  cards: [],         // event id (카드 = 이벤트 카드)
  solvedCases: [],   // special case index
  patientsServed: 0,
  lastSave: Date.now(),
  pendingEvent: null,
  promo: {
    firstEpisodePrompted: false,
    firstEpisodeClicked: false,
    firstEpisodeRewardClaimed: false,
    firstEpisodeClickedAt: 0,
    firstEpisodeCheckedAt: 0,
  },
});

let S = DEFAULT_STATE();

/* 파생 배율 (매번 재계산) */
let M = {};
function recalcMods() {
  M = { goldMul: 1, repMul: 1, tapMul: 2, brewSpeed: 1, spawnRate: 1, specialMul: 1 };
  DATA.upgrades.forEach(u => { const lv = S.upgrades[u.id] || 0; if (lv) u.apply(lv, M); });
  DATA.staff.forEach(st => { const lv = S.staff[st.id] || 0; if (lv) st.apply(lv, M); });
  DATA.skills.forEach(sk => { const lv = S.skills[sk.id] || 0; if (lv) sk.apply(lv, M); });
  const auroraMul = 1 + S.shards * 0.25;
  M.goldMul *= auroraMul;
  M.repMul *= auroraMul;
}

function goldPerPatient() { return 8 * M.goldMul; }
function repPerPatient() { return 1 * M.repMul; }
function brewDuration() { return 4000 / M.brewSpeed; }
function spawnInterval() { return Math.max(900, 3200 / M.spawnRate); }
function goldPerSec() { // 자동 생산 추정치 (오프라인 보상용)
  const cycle = Math.max(brewDuration(), spawnInterval());
  return goldPerPatient() / (cycle / 1000);
}

/* ---------- 저장/로드 ---------- */
const SAVE_KEY = "garim_pharmacy_save_v1";
let resetting = false; // 초기화 직후 reload 전 자동 저장 방지
function save() {
  if (resetting) return;
  S.lastSave = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* 저장 불가 환경 */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    const defaults = DEFAULT_STATE();
    S = Object.assign(defaults, data);
    S.promo = Object.assign(defaults.promo, data.promo || {});
    return true;
  } catch (e) { return false; }
}

/* ---------- 씬: 환자 큐 ---------- */
const MAX_QUEUE = 4;
let queue = [];          // {el, isSpecial, caseIdx}
let brewing = false;
let brewTimer = null;
let specialWaiting = false;

function pickCustomerMood() {
  return CUSTOMER_MOODS[Math.floor(Math.random() * CUSTOMER_MOODS.length)];
}

function patientBubbleHtml(talk, mood) {
  return `
    <span class="mood-bubble mood-${mood.id}">
      <b>${mood.emoji}</b><small>${mood.label}</small>
    </span>
    <span class="bubble talk-bubble">${talk}</span>`;
}

function clearPatientBubbleTimers(item) {
  if (!item?.bubbleTimers) return;
  item.bubbleTimers.forEach(clearTimeout);
  item.bubbleTimers = [];
}

function setPatientBubble(item, mode) {
  if (!item?.el?.isConnected) return;
  item.el.classList.remove("talking", "show-mood", "show-talk");
  if (mode === "mood") item.el.classList.add("show-mood");
  if (mode === "talk") item.el.classList.add("show-talk");
}

function queuePatientBubbles(item) {
  clearPatientBubbleTimers(item);
  setPatientBubble(item, "mood");
  item.bubbleTimers.push(setTimeout(() => setPatientBubble(item, "talk"), 950));
  item.bubbleTimers.push(setTimeout(() => setPatientBubble(item, null), 3250));
}

function spawnPatient(special = false) {
  if (queue.length >= MAX_QUEUE) return;
  const wrap = $("#queue");
  const el = document.createElement("div");
  el.className = "patient" + (special ? " special" : "");
  let caseIdx = -1;
  let mood = SPECIAL_MOOD;
  if (special) {
    const unsolved = DATA.specialCases.map((c, i) => i).filter(i => !S.solvedCases.includes(i));
    caseIdx = unsolved.length
      ? unsolved[Math.floor(Math.random() * unsolved.length)]
      : Math.floor(Math.random() * DATA.specialCases.length);
    el.innerHTML = CHARS.mystery() + patientBubbleHtml("뭔가 수상한데…?", mood);
  } else {
    const p = CHARS.customers[Math.floor(Math.random() * CHARS.customers.length)];
    const talk = p.talks[Math.floor(Math.random() * p.talks.length)];
    mood = pickCustomerMood();
    el.innerHTML = p.svg() + patientBubbleHtml(talk, mood);
  }
  const item = { el, isSpecial: special, caseIdx, mood, bubbleTimers: [] };
  el.addEventListener("pointerdown", e => {
    e.stopPropagation();
    tapPatient(item);
  });
  wrap.appendChild(el);
  queue.push(item);
  if (special) specialWaiting = true;
  queuePatientBubbles(item);
  tryAutoBrew();
}

function removePatient(item) {
  const i = queue.indexOf(item);
  if (i >= 0) queue.splice(i, 1);
  clearPatientBubbleTimers(item);
  item.el.remove();
  if (item.isSpecial) specialWaiting = queue.some(q => q.isSpecial);
}

function applyPatientMoodReward(item, x, y) {
  const mood = item.mood;
  if (!mood || item.isSpecial) return null;
  if (mood.bonus === "gift") {
    const gift = goldPerPatient() * 3;
    S.gold += gift;
    floatText(x - 22, y - 18, `🎁 +${fmt(gift)}💰`, "gift");
    return "고맙습니다. 직원들이랑 나눌게요.";
  }
  if (mood.bonus === "clue") {
    const rep = repPerPatient() * 6;
    addRep(rep);
    floatText(x - 18, y - 18, `🕵️ +${fmt(rep)}⭐`, "rep");
    return "단서가 생겼어요. 약봉투를 확인하죠.";
  }
  if (mood.bonus === "calm") {
    const rep = repPerPatient() * 3;
    addRep(rep);
    floatText(x - 18, y - 18, `😌 +${fmt(rep)}⭐`, "rep");
    return "진상 응대 완료. 다음 환자 받을게요.";
  }
  if (mood.bonus === "care") {
    const rep = repPerPatient() * 2;
    addRep(rep);
    floatText(x - 18, y - 18, `💞 +${fmt(rep)}⭐`, "rep");
    return "불안한 환자일수록 설명이 중요해요.";
  }
  return null;
}

function servePatient(item, mul, label) {
  const rect = item.el.getBoundingClientRect();
  const appRect = $("#app").getBoundingClientRect();
  const x = rect.left - appRect.left + rect.width / 2;
  const y = rect.top - appRect.top;
  const g = goldPerPatient() * mul;
  const r = repPerPatient() * mul;
  S.gold += g;
  addRep(r);
  S.patientsServed++;
  floatText(x, y, `+${fmt(g)}💰`, mul > 1.5 ? "big" : "");
  floatText(x + 24, y + 16, `+${fmt(r)}⭐`, "rep");
  const moodLine = applyPatientMoodReward(item, x, y);
  removePatient(item);
  if (label || moodLine) gaminSay(label || moodLine);
  updateHUD();
}

function tapPatient(item) {
  if (item.isSpecial) { openSpecialCase(item); return; }
  servePatient(item, M.tapMul, null);
}

/* 자동 조제 */
function tryAutoBrew() {
  if (brewing) return;
  const target = queue.find(q => !q.isSpecial);
  if (!target) return;
  brewing = true;
  $("#gamin").classList.add("working");
  const barWrap = $("#brewBarWrap");
  const bar = $("#brewBar");
  barWrap.classList.add("show");
  const dur = brewDuration();
  const start = performance.now();
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    bar.style.width = (p * 100) + "%";
    if (p < 1 && brewing) { brewTimer = requestAnimationFrame(step); }
    else if (brewing) {
      brewing = false;
      $("#gamin").classList.remove("working");
      barWrap.classList.remove("show");
      bar.style.width = "0%";
      if (queue.includes(target)) servePatient(target, 1, null);
      tryAutoBrew();
    }
  }
  brewTimer = requestAnimationFrame(step);
}

/* 씬 빈 곳 탭 → 가민 한마디 */
$("#scene").addEventListener("pointerdown", () => {
  if (Math.random() < 0.3) gaminSay(DATA.quotes[Math.floor(Math.random() * DATA.quotes.length)]);
});

let gaminSayTimer = null;
function gaminSay(text) {
  const b = $("#gaminBubble");
  b.textContent = text;
  b.classList.add("show");
  clearTimeout(gaminSayTimer);
  gaminSayTimer = setTimeout(() => b.classList.remove("show"), 2600);
}

function floatText(x, y, text, cls = "") {
  const el = document.createElement("div");
  el.className = "float-txt " + cls;
  el.textContent = text;
  el.style.left = x + "px";
  el.style.top = y + "px";
  $("#app").appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/* ---------- 명성/이벤트 ---------- */
function addRep(r) {
  S.rep += r;
  S.lifetimeRep += r;
  checkEventUnlock();
  checkAuroraUnlock();
}

function nextEvent() {
  return DATA.events.find(e => !S.clearedEvents.includes(e.id));
}

function checkEventUnlock() {
  const ev = nextEvent();
  const banner = $("#eventBanner");
  if (ev && S.rep >= ev.rep && !S.pendingEvent) {
    S.pendingEvent = ev.id;
  }
  if (S.pendingEvent) {
    const pev = DATA.events.find(e => e.id === S.pendingEvent);
    const alertText = pev.case?.trigger || pev.title;
    banner.innerHTML = `
      <span class="blink">🚨</span>
      <span class="event-copy">
        <b>사건 발생</b>
        <small>${alertText}</small>
      </span>`;
    banner.classList.add("show");
  } else {
    banner.classList.remove("show");
  }
}

$("#eventBanner").addEventListener("pointerdown", e => {
  e.stopPropagation();
  if (S.pendingEvent) openStory(DATA.events.find(ev => ev.id === S.pendingEvent));
});

/* ---------- 스토리 모달 ---------- */
const storyBack = $("#storyBack");
let storyState = null;

function caseLabel(ev) {
  return `케이스 ${String(ev.id).padStart(2, "0")} · ${ev.ep}`;
}

function caseBriefHtml(ev) {
  const c = ev.case || {
    urgency: "긴급 사건",
    trigger: ev.title,
    goal: ev.choice.prompt,
    stakes: "판단에 따라 보상이 달라집니다.",
    clues: ev.scenes.slice(0, 3).map(sc => sc.spk === "나레이션" ? sc.text.split(/[.!?。]/)[0] : sc.spk),
  };
  return `
    <div class="case-brief">
      <div class="case-status">
        <span class="case-pill">긴급도 · ${c.urgency}</span>
        <span>${caseLabel(ev)}</span>
      </div>
      <div class="case-trigger">${c.trigger}</div>
      <div class="case-goal">${c.goal}</div>
      <div class="case-clues">
        ${c.clues.map(clue => `<span>${clue}</span>`).join("")}
      </div>
      <div class="case-stakes">${c.stakes}</div>
    </div>
    <button class="modal-btn" id="caseStart">증거 확인하기</button>`;
}

function openStory(ev) {
  storyState = { ev, idx: 0, phase: "case" };
  renderStory();
  storyBack.classList.add("show");
}

function renderStory() {
  const { ev, idx, phase } = storyState;
  const m = $("#storyModal");
  let html = `
    <div class="rx-head">
      <span class="ep-tag">🗂️ ${caseLabel(ev)}</span>
      <h2>${ev.title}</h2>
      <div class="rx-no">처 방 전 · 교부번호 ${String(ev.id).padStart(3, "0")}호</div>
    </div>`;
  if (phase === "case") {
    html += caseBriefHtml(ev);
    m.innerHTML = html;
    m.onclick = null;
    $("#caseStart").addEventListener("click", () => {
      storyState.phase = "scene";
      renderStory();
    });
  } else if (phase === "scene") {
    const sc = ev.scenes[idx];
    html += `
      <div class="scene-box" id="sceneBox">
        <div class="scene-spk ${sc.spk === "나레이션" ? "narr" : ""}">${sc.spk === "나레이션" ? "···" : "💬 " + sc.spk}</div>
        <div class="scene-txt">${sc.text}</div>
      </div>
      <div class="tap-hint">▼ 탭해서 계속 (${idx + 1}/${ev.scenes.length})</div>`;
    m.innerHTML = html;
    m.onclick = () => {
      if (storyState.idx < ev.scenes.length - 1) { storyState.idx++; renderStory(); }
      else { storyState.phase = "choice"; renderStory(); }
    };
  } else if (phase === "choice") {
    html += `
      <div class="q-title">${ev.choice.prompt}</div>
      <div class="choice-wrap">
        ${ev.choice.options.map((o, i) => `<button class="choice-btn" data-i="${i}">${o}</button>`).join("")}
      </div>`;
    m.innerHTML = html;
    m.onclick = null;
    m.querySelectorAll(".choice-btn").forEach(btn => {
      btn.addEventListener("click", () => { storyState.phase = "reward"; renderStory(); });
    });
  } else {
    const r = ev.reward;
    if (storyState.evGold == null) storyState.evGold = Math.max(150, Math.floor(goldPerSec() * 600));
    const chips = [`💰 +${fmt(storyState.evGold)}`];
    if (r.psy) chips.push(`🧠 심리 +${r.psy}`);
    if (r.rel) chips.push(`💞 관계 +${r.rel}`);
    if (r.tech) chips.push(`⚗️ 기술 +${r.tech}`);
    html += `
      <div class="reward-box">
        <div class="rw-title">✦ 사건 해결! ✦</div>
        <div class="rw-items">${chips.map(c => `<span class="rw-chip">${c}</span>`).join("")}</div>
      </div>
      <div class="card-get">
        <div class="cg-emoji">${ev.card.emoji}</div>
        <div class="cg-name">사건 기록 「${ev.card.name}」 획득!</div>
        <div class="cg-desc">${ev.card.desc}</div>
        <span class="cg-ep">${caseLabel(ev)} · 해결 완료</span>
      </div>
      <button class="modal-btn" id="storyDone">약국으로 돌아가기</button>`;
    m.innerHTML = html;
    m.onclick = null;
    $("#storyDone").addEventListener("click", () => {
      S.gold += storyState.evGold;
      S.psy += r.psy; S.rel += r.rel; S.tech += r.tech;
      S.clearedEvents.push(ev.id);
      S.cards.push(ev.id);
      S.pendingEvent = null;
      storyBack.classList.remove("show");
      recalcMods();
      checkEventUnlock();
      updateHUD();
      renderPanel();
      save();
      toast(`📜 「${ev.card.name}」 사건 기록이 추가됐어요!`);
      setTimeout(maybeShowFirstEpisodePromo, 700);
      if (ev.id === DATA.events[DATA.events.length - 1].id) {
        setTimeout(() => toast("🎉 모든 사건 해결! 다음 회차의 경고가 열렸습니다"), 2600);
      }
    });
  }
}

/* ---------- 특수 환자 (홀로그램 퀴즈) ---------- */
const specialBack = $("#specialBack");

function openSpecialCase(item) {
  clearPatientBubbleTimers(item);
  setPatientBubble(item, null);
  const c = DATA.specialCases[item.caseIdx];
  const m = $("#specialModal");
  const reward = goldPerPatient() * 60 * M.specialMul;
  m.innerHTML = `
    <div class="rx-head">
      <span class="ep-tag">✨ 수수께끼 환자 · ${c.ep}</span>
      <h2>${c.emoji} ${c.name}</h2>
    </div>
    <div class="holo-frame">
      <div class="hf-tag">⟡ HOLOGRAM PRESCRIPTION ⟡</div>
      <div class="hf-story">${c.story}</div>
    </div>
    <div class="q-title">${c.q}</div>
    <div class="choice-wrap">
      ${c.options.map((o, i) => `<button class="choice-btn" data-i="${i}">${o}</button>`).join("")}
    </div>
    <div id="caseResult"></div>`;
  specialBack.classList.add("show");
  m.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pick = +btn.dataset.i;
      const correct = pick === c.answer;
      m.querySelectorAll(".choice-btn").forEach((b, i) => {
        b.disabled = true;
        if (i === c.answer) b.classList.add("correct");
        else if (i === pick) b.classList.add("wrong");
      });
      const finalReward = correct ? reward : reward * 0.3;
      const res = $("#caseResult");
      res.innerHTML = `
        <div class="explain-box">
          <b>${correct ? "🎯 정확한 처방!" : "💡 가민의 한 수!"}</b><br>${c.explain}
        </div>
        <div class="reward-box">
          <div class="rw-items">
            <span class="rw-chip">💰 +${fmt(finalReward)}</span>
            <span class="rw-chip">⭐ +${fmt(repPerPatient() * 25 * M.specialMul)}</span>
            ${correct && !S.solvedCases.includes(item.caseIdx) ? `<span class="rw-chip">⚗️ 기술 +1</span>` : ""}
          </div>
        </div>
        <button class="modal-btn" id="caseDone">복약지도 완료!</button>`;
      $("#caseDone").addEventListener("click", () => {
        S.gold += finalReward;
        addRep(repPerPatient() * 25 * M.specialMul);
        if (correct && !S.solvedCases.includes(item.caseIdx)) {
          S.tech += 1;
          S.solvedCases.push(item.caseIdx);
        }
        specialBack.classList.remove("show");
        removePatient(item);
        gaminSay(correct ? "역시, 홀로그램 처방전은 거짓말을 안 해." : "다음엔 더 잘 볼 수 있을 거야.");
        recalcMods();
        updateHUD();
        renderPanel();
        save();
      });
    });
  });
}

/* ---------- 동료 카메오 ---------- */
let staffCameoTimer = null;
let lastStaffCameo = Date.now();
const STAFF_CAMEO_INTERVAL = 18000;

function availableStaffIds() {
  const ids = DATA.staff
    .filter(st => st.unlockRep <= S.rep || (S.staff[st.id] || 0) > 0)
    .map(st => st.id)
    .filter(id => STAFF_CAMEOS[id]);
  if (!ids.includes("miso")) ids.unshift("miso");
  return ids;
}

function pickStaffCameoId() {
  const ids = availableStaffIds();
  return ids[Math.floor(Math.random() * ids.length)];
}

function staffMeta(id) {
  const staff = DATA.staff.find(st => st.id === id) || DATA.staff[0];
  return { ...STAFF_CAMEOS[id], name: staff.name, id };
}

function applyStaffCameoHelp(meta) {
  const goldGain = meta.gold ? Math.max(20, Math.floor(goldPerPatient() * meta.gold)) : 0;
  const repGain = meta.rep ? Math.max(3, Math.floor(repPerPatient() * meta.rep)) : 0;
  if (goldGain) S.gold += goldGain;
  if (repGain) addRep(repGain);
  updateHUD();
  save();
  return { goldGain, repGain };
}

function showStaffCameo(id = null, force = false) {
  if (!force && isModalOpen()) return false;
  const meta = staffMeta(id || pickStaffCameoId());
  if (!meta?.name) return false;

  clearTimeout(staffCameoTimer);
  const prev = $("#staffCameo");
  if (prev) prev.remove();

  const help = applyStaffCameoHelp(meta);
  const el = document.createElement("div");
  el.id = "staffCameo";
  el.className = `staff-cameo ${meta.side === "right" ? "right" : "left"} show`;
  el.innerHTML = `
    <div class="staff-face">${CHARS.staff(meta.id)}</div>
    <div class="staff-speech">
      <b>${meta.name}</b><small>${meta.role}</small>
      <span>${meta.line}</span>
      <em>${meta.effect}${help.goldGain ? fmt(help.goldGain) + "골드" : fmt(help.repGain) + "명성"}</em>
    </div>`;
  $("#shopFloor").appendChild(el);
  lastStaffCameo = Date.now();
  staffCameoTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 260);
  }, 4300);
  return true;
}
window.showStaffCameo = showStaffCameo;

function maybeShowStaffCameo() {
  if (Date.now() - lastStaffCameo < STAFF_CAMEO_INTERVAL) return;
  if (queue.length < 2 && S.patientsServed < 3) return;
  showStaffCameo();
}

/* ---------- 오로라 회귀 (프레스티지) ---------- */
const AURORA_REQ = 250000; // lifetimeRep 기준 최초 해금

function shardsOnRegress() {
  return Math.floor(Math.pow(S.lifetimeRep / 50000, 0.55));
}

function checkAuroraUnlock() {
  const btn = $("#auroraBtn");
  const gain = shardsOnRegress() - S.shards;
  if (S.lifetimeRep >= AURORA_REQ && gain > 0) {
    btn.classList.add("show");
    btn.textContent = `🌌 회귀 +${gain}`;
  } else {
    btn.classList.remove("show");
  }
}

$("#auroraBtn").addEventListener("pointerdown", e => {
  e.stopPropagation();
  openAuroraConfirm();
});

function openAuroraConfirm() {
  const gain = shardsOnRegress() - S.shards;
  const m = $("#genericModal");
  m.innerHTML = `
    <div class="rx-head">
      <span class="ep-tag">🌌 회귀 시스템</span>
      <h2>오로라가 떴습니다</h2>
    </div>
    <div class="scene-txt" style="text-align:center; line-height:1.8;">
      하늘에 오로라가 뜨고, 꺼져 있던 프린터가 움직입니다.<br>
      <b>회귀</b>하면 골드·업그레이드·직원·명성이 초기화되지만,<br>
      <b style="color:#7c5cc4">오로라 조각 +${gain}개</b>를 얻습니다.<br><br>
      조각 1개 = 조제료 & 명성 <b>+25% 영구 증가</b><br>
      <span style="font-size:.68rem; color:var(--ink-soft)">(성장 수치 · 스킬 · 처방전 카드 · 사건 진행은 유지됩니다)</span>
    </div>
    <button class="modal-btn aurora-go" id="doRegress">🌌 회귀한다 — 다시, 처음부터</button>
    <button class="modal-btn sub" id="cancelRegress">아직은 때가 아니야</button>`;
  $("#genericBack").classList.add("show");
  $("#doRegress").addEventListener("click", doRegress);
  $("#cancelRegress").addEventListener("click", () => $("#genericBack").classList.remove("show"));
}

function doRegress() {
  $("#genericBack").classList.remove("show");
  const ov = $("#auroraOverlay");
  ov.classList.add("show");
  S.shards = shardsOnRegress();
  S.regressions++;
  S.gold = 0;
  S.rep = 0;
  S.upgrades = {};
  S.staff = {};
  S.pendingEvent = null;
  queue.slice().forEach(removePatient);
  brewing = false;
  $("#gamin").classList.remove("working");
  $("#brewBarWrap").classList.remove("show");
  recalcMods();
  save();
  setTimeout(() => {
    ov.classList.remove("show");
    $("#scene").classList.remove("aurora-on");
    updateHUD();
    renderPanel();
    checkEventUnlock();
    checkAuroraUnlock();
    gaminSay("다시… 2001년이군. 좋아, 한 번 더다.");
  }, 3400);
}

/* ---------- 원작 1~5화 무료 보급 ---------- */
function isModalOpen() {
  return $("#genericBack").classList.contains("show")
    || storyBack.classList.contains("show")
    || specialBack.classList.contains("show");
}

function originalReadStateText() {
  if (S.promo?.firstEpisodeRewardClaimed) return "완료";
  if (S.promo?.firstEpisodeClicked) return "확인 중";
  return "미확인";
}

function renderOriginCheckBadge() {
  const scene = $("#scene");
  if (!scene || !S.promo) return;
  const active = S.promo.firstEpisodeClicked || S.promo.firstEpisodeRewardClaimed;
  let badge = $("#originCheckBadge");
  if (!active) {
    if (badge) badge.remove();
    return;
  }
  if (!badge) {
    badge = document.createElement("button");
    badge.id = "originCheckBadge";
    badge.type = "button";
    badge.addEventListener("pointerdown", e => e.stopPropagation());
    badge.addEventListener("click", () => showFirstEpisodePromo(true));
    scene.appendChild(badge);
  }
  const done = S.promo.firstEpisodeRewardClaimed;
  badge.className = `origin-check-badge ${done ? "checked" : "pending"}`;
  badge.textContent = done ? "✅ 원작 1화 확인 완료" : "📖 원작 확인 중";
  badge.setAttribute("aria-label", done ? "원작 1화 확인 완료" : "원작 1화 확인 중");
}

function showFirstEpisodePromo(force = false) {
  if (!S.promo) S.promo = Object.assign(DEFAULT_STATE().promo, {});
  if (!force && (S.promo.firstEpisodePrompted || S.promo.firstEpisodeRewardClaimed)) return false;

  S.promo.firstEpisodePrompted = true;
  const canClaim = S.promo.firstEpisodeClicked && !S.promo.firstEpisodeRewardClaimed;
  const readState = originalReadStateText();
  const m = $("#genericModal");
  m.innerHTML = `
    <div class="promo-modal">
      <div class="rx-head promo-head">
        <span class="ep-tag">📖 무료 1~5화</span>
        <h2>1화 보고 회귀 처방 키트 받기</h2>
        <div class="rx-no">비로그인도 5화까지 무료</div>
      </div>
      <div class="promo-copy">
        사건을 따라가기 전에 원작 1화를 열어보세요. 게임으로 돌아오면 약국 운영에 바로 쓰는 키트를 지급합니다.
      </div>
      <div class="promo-read-state ${S.promo.firstEpisodeClicked ? "checked" : ""}" id="promoReadState">
        ${readState === "완료" ? "✅ 원작 1화 확인 완료" : readState === "확인 중" ? "📖 1화 링크 열림 · 확인 중" : "□ 원작 1화 확인 전"}
      </div>
      <div class="promo-links" aria-label="무료 회차 링크">
        ${ORIGINAL_FREE_EPISODES.map(ep => `
          <a
            class="promo-ep ${ep.no === 1 ? "main" : ""}"
            id="${ep.no === 1 ? "promoEpisodeOne" : ""}"
            href="${ep.url}"
            target="_blank"
            rel="noopener"
          >
            <strong>${ep.no}화</strong><span>${ep.no === 1 ? "보상 열기" : "무료 보기"}</span>
          </a>
        `).join("")}
      </div>
      <div class="promo-reward">
        <b>회귀 처방 키트</b>
        <span>골드 + 기술 + 명성 보너스</span>
      </div>
      <button class="modal-btn" id="claimEpisodeReward" ${canClaim ? "" : "disabled"}>
        ${S.promo.firstEpisodeRewardClaimed ? "이미 받았습니다" : "🎁 1화 보고 왔어요"}
      </button>
      <button class="modal-btn sub" id="closePromo">나중에</button>
    </div>`;
  $("#genericBack").classList.add("show");

  $("#promoEpisodeOne").addEventListener("click", () => {
    S.promo.firstEpisodeClicked = true;
    S.promo.firstEpisodeClickedAt = Date.now();
    S.promo.firstEpisodeCheckedAt = S.promo.firstEpisodeCheckedAt || S.promo.firstEpisodeClickedAt;
    const readState = $("#promoReadState");
    if (readState) {
      readState.textContent = "📖 1화 링크 열림 · 게임 안에 확인 표시가 남았습니다";
      readState.classList.add("checked");
    }
    const claim = $("#claimEpisodeReward");
    if (!S.promo.firstEpisodeRewardClaimed) {
      claim.disabled = false;
      claim.textContent = "🎁 보고 왔어요 — 키트 받기";
    }
    renderOriginCheckBadge();
    save();
  });

  $("#claimEpisodeReward").addEventListener("click", () => {
    if (S.promo.firstEpisodeRewardClaimed) return;
    if (!S.promo.firstEpisodeClicked) {
      toast("먼저 1화 링크를 열어주세요");
      return;
    }
    const goldReward = Math.max(300, Math.floor(goldPerSec() * 360));
    const repReward = Math.max(20, Math.floor(repPerPatient() * 30));
    S.gold += goldReward;
    S.tech += 1;
    addRep(repReward);
    S.promo.firstEpisodeRewardClaimed = true;
    S.promo.firstEpisodeCheckedAt = S.promo.firstEpisodeCheckedAt || Date.now();
    $("#genericBack").classList.remove("show");
    recalcMods();
    updateHUD();
    renderPanel();
    save();
    toast(`🎁 회귀 처방 키트 획득! +${fmt(goldReward)}골드`);
  });

  $("#closePromo").addEventListener("click", () => {
    $("#genericBack").classList.remove("show");
    save();
  });
  save();
  return true;
}
window.showFirstEpisodePromo = showFirstEpisodePromo;

function maybeShowFirstEpisodePromo() {
  if (!S.promo) S.promo = Object.assign(DEFAULT_STATE().promo, {});
  if (S.promo.firstEpisodePrompted || S.promo.firstEpisodeRewardClaimed) return;
  if (S.clearedEvents.length < 1 && S.patientsServed < 8) return;
  if (isModalOpen()) return;
  showFirstEpisodePromo(false);
}

/* ---------- HUD ---------- */
function updateHUD() {
  $("#goldVal").textContent = fmt(S.gold);
  $("#repVal").textContent = fmt(S.rep);
  $("#shardVal").textContent = S.shards + (S.shards ? ` (+${S.shards * 25}%)` : "");
  const ev = nextEvent();
  $("#repLbl").textContent = ev ? `명성 (다음 사건 ${fmt(ev.rep)})` : "명성 (완결!)";
  if (S.lifetimeRep >= AURORA_REQ * 0.7) $("#scene").classList.add("aurora-on");
  renderOriginCheckBadge();
  // 패널 버튼 갱신 (비용 도달 알림)
  refreshAfford();
  maybeShowFirstEpisodePromo();
}

/* ---------- 하단 패널 ---------- */
let currentTab = "upgrade";

const TABS = {
  upgrade: renderUpgrades,
  staff: renderStaff,
  growth: renderGrowth,
  cards: renderCards,
  etc: renderEtc,
};

$$(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentTab = btn.dataset.tab;
    $$(".nav-btn").forEach(b => b.classList.toggle("active", b === btn));
    renderPanel();
  });
});

function renderPanel() {
  TABS[currentTab]();
}

function upgradeCost(u, lv) { return Math.floor(u.baseCost * Math.pow(u.costMul, lv)); }
function staffCost(st, lv) { return Math.floor(st.baseCost * Math.pow(st.costMul, lv)); }

function renderUpgrades() {
  const p = $("#panel");
  let html = `<div class="panel-title">🛠️ 약국 업그레이드 <small>탭하면 즉시 강해져요</small></div>`;
  DATA.upgrades.forEach(u => {
    const lv = S.upgrades[u.id] || 0;
    const cost = upgradeCost(u, lv);
    const maxed = lv >= u.max;
    html += `
      <div class="item-card">
        <div class="big-ico">${u.emoji}</div>
        <div class="info">
          <div class="nm">${u.name} <span class="lv">Lv.${lv}</span></div>
          <div class="ds">${u.desc}</div>
          <div class="ef">📈 ${u.effect(lv)}${maxed ? "" : " → " + u.effect(lv + 1)}</div>
        </div>
        <button class="buy-btn" data-type="upgrade" data-id="${u.id}" data-cost="${cost}" ${maxed ? "disabled" : ""}>
          ${maxed ? "MAX" : `💰 ${fmt(cost)}`}
        </button>
      </div>`;
  });
  p.innerHTML = html;
  bindBuyButtons();
}

function renderStaff() {
  const p = $("#panel");
  let html = `<div class="panel-title">👥 가림약국 식구들 <small>사건을 버티는 핵심 전력</small></div>`;
  DATA.staff.forEach(st => {
    const lv = S.staff[st.id] || 0;
    const locked = S.rep < st.unlockRep && lv === 0;
    const cost = staffCost(st, lv);
    html += `
      <div class="item-card ${locked ? "locked" : ""}">
        <div class="big-ico">${st.emoji}</div>
        <div class="info">
          <div class="nm">${st.name} <span class="role">${st.role}</span> ${lv ? `<span class="lv">Lv.${lv}</span>` : ""}</div>
          <div class="ds">${locked ? `🔒 명성 ${fmt(st.unlockRep)} 달성 시 영입 가능` : (lv ? `“${st.quote}”` : st.desc)}</div>
          <div class="ef">📈 ${st.effect}</div>
        </div>
        <button class="buy-btn" data-type="staff" data-id="${st.id}" data-cost="${cost}" ${locked ? "disabled" : ""}>
          ${lv === 0 ? "영입" : "강화"}<br>💰 ${fmt(cost)}
        </button>
      </div>`;
  });
  p.innerHTML = html;
  bindBuyButtons();
}

function renderGrowth() {
  const p = $("#panel");
  let html = `
    <div class="panel-title">🌱 성장 수치 <small>사건을 해결하면 쌓여요</small></div>
    <div id="statBar">
      <div class="stat-chip psy">🧠 심리<span class="n">${S.psy}</span></div>
      <div class="stat-chip rel">💞 관계<span class="n">${S.rel}</span></div>
      <div class="stat-chip tech">⚗️ 기술<span class="n">${S.tech}</span></div>
    </div>`;
  DATA.skills.forEach(sk => {
    const lv = S.skills[sk.id] || 0;
    const cost = sk.cost(lv);
    const have = S[sk.stat];
    html += `
      <div class="item-card">
        <div class="big-ico">${sk.emoji}</div>
        <div class="info">
          <div class="nm">${sk.name} <span class="lv">Lv.${lv}</span></div>
          <div class="ds">${sk.desc}</div>
          <div class="ef">📈 ${sk.effect(lv)} → ${sk.effect(lv + 1)}</div>
        </div>
        <button class="buy-btn skill-${sk.color}" data-type="skill" data-id="${sk.id}" ${have < cost ? "disabled" : ""}>
          ${sk.emoji} ${cost} 사용
        </button>
      </div>`;
  });
  html += `<div style="font-size:.62rem; color:var(--ink-soft); text-align:center; padding:6px 0 10px;">
    【성장 수치를 사용하시겠습니까?】 — 수치는 스토리 사건과 ✨수수께끼 환자에게서 얻어요</div>`;
  p.innerHTML = html;
  bindBuyButtons();
}

function renderCards() {
  const p = $("#panel");
  const owned = S.cards.length;
  let html = `<div class="panel-title">📚 사건 기록 보드 <small>${owned}/${DATA.events.length} 해결</small></div><div id="cardGrid">`;
  DATA.events.forEach(ev => {
    const has = S.cards.includes(ev.id);
    html += `
      <div class="rx-card ${has ? "owned" : "missing"}" data-ev="${ev.id}">
        <span class="ce">${has ? ev.card.emoji : "❓"}</span>
        <span class="cn">${has ? ev.card.name : "???"}</span>
        <span class="cep">${caseLabel(ev)}</span>
      </div>`;
  });
  html += `</div>
    <div class="case-manual">
      <div class="cm-t">📌 사건 기록 규칙</div>
      <div class="cm-d">명성이 오르면 긴급 케이스가 열립니다.<br>증거를 확인하고 판단을 내리면 성장 수치와 기록 카드가 쌓입니다.</div>
    </div>`;
  p.innerHTML = html;
  p.querySelectorAll(".rx-card.owned").forEach(el => {
    el.addEventListener("click", () => {
      const ev = DATA.events.find(e => e.id === +el.dataset.ev);
      const m = $("#genericModal");
      m.innerHTML = `
        <div class="card-get" style="margin-top:0">
          <div class="cg-emoji" style="font-size:3rem">${ev.card.emoji}</div>
          <div class="cg-name">「${ev.card.name}」</div>
          <div class="cg-desc">${ev.card.desc}</div>
          <span class="cg-ep">${caseLabel(ev)} · 「${ev.title}」</span>
        </div>
        <button class="modal-btn" onclick="document.querySelector('#genericBack').classList.remove('show')">닫기</button>`;
      $("#genericBack").classList.add("show");
    });
  });

}

function renderEtc() {
  const p = $("#panel");
  p.innerHTML = `
    <div class="panel-title">⚙️ 약국 운영 일지</div>
    <div class="item-card" style="flex-direction:column; align-items:stretch; gap:0;">
      <div class="settings-row"><span>👨‍⚕️ 누적 복약지도</span><b class="jua">${fmt(S.patientsServed)}명</b></div>
      <div class="settings-row"><span>⭐ 누적 명성</span><b class="jua">${fmt(S.lifetimeRep)}</b></div>
      <div class="settings-row"><span>🌌 회귀 횟수</span><b class="jua">${S.regressions}회</b></div>
      <div class="settings-row"><span>📜 해결한 사건</span><b class="jua">${S.clearedEvents.length} / ${DATA.events.length}</b></div>
      <div class="settings-row"><span>✨ 풀어낸 수수께끼</span><b class="jua">${S.solvedCases.length} / ${DATA.specialCases.length}</b></div>
      <div class="settings-row"><span>📖 원작 1화 확인</span><b class="jua origin-read-state">${originalReadStateText()}</b></div>
      <div class="settings-row" style="border-bottom:none;">
        <span>💾 저장 데이터</span>
        <button class="mini-btn danger" id="resetBtn">초기화</button>
      </div>
    </div>
    <div class="case-manual">
      <div class="cm-t">🩺 운영 목표</div>
      <div class="cm-d">환자를 빠르게 처리해 명성을 올리고, 터지는 사건마다 증거를 읽어 약국의 운명을 바꾸세요.</div>
    </div>`;
  $("#resetBtn").addEventListener("click", () => {
    const m = $("#genericModal");
    m.innerHTML = `
      <div class="rx-head"><h2>정말 초기화할까요?</h2></div>
      <div class="scene-txt" style="text-align:center">모든 진행 상황이 사라집니다.<br>이건 회귀가 아니라 진짜 리셋이에요!</div>
      <button class="modal-btn" style="background:linear-gradient(180deg,#ff9a8a,#e8604c); box-shadow:0 4px 0 #c04a38;" id="confirmReset">네, 전부 지웁니다</button>
      <button class="modal-btn sub" id="cancelReset">취소</button>`;
    $("#genericBack").classList.add("show");
    $("#confirmReset").addEventListener("click", () => {
      resetting = true;
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    });
    $("#cancelReset").addEventListener("click", () => $("#genericBack").classList.remove("show"));
  });
}

function bindBuyButtons() {
  $$(".buy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const { type, id } = btn.dataset;
      if (type === "upgrade") {
        const u = DATA.upgrades.find(x => x.id === id);
        const lv = S.upgrades[id] || 0;
        const cost = upgradeCost(u, lv);
        if (S.gold < cost || lv >= u.max) return;
        S.gold -= cost;
        S.upgrades[id] = lv + 1;
        toast(`${u.emoji} ${u.name} Lv.${lv + 1}!`);
      } else if (type === "staff") {
        const st = DATA.staff.find(x => x.id === id);
        const lv = S.staff[id] || 0;
        const cost = staffCost(st, lv);
        if (S.gold < cost) return;
        S.gold -= cost;
        S.staff[id] = lv + 1;
        toast(lv === 0 ? `${st.emoji} ${st.name} 영입! “${st.quote}”` : `${st.emoji} ${st.name} Lv.${lv + 1}!`);
      } else if (type === "skill") {
        const sk = DATA.skills.find(x => x.id === id);
        const lv = S.skills[id] || 0;
        const cost = sk.cost(lv);
        if (S[sk.stat] < cost) return;
        S[sk.stat] -= cost;
        S.skills[id] = lv + 1;
        toast(`${sk.emoji} ${sk.name} Lv.${lv + 1}! 【성장 수치를 사용했습니다】`);
      }
      recalcMods();
      updateHUD();
      renderPanel();
      save();
    });
  });
  refreshAfford();
}

function refreshAfford() {
  $$(".buy-btn").forEach(btn => {
    if (btn.disabled && btn.textContent.includes("MAX")) return;
    const { type, id, cost } = btn.dataset;
    if (type === "upgrade" || type === "staff") {
      const locked = btn.closest(".item-card")?.classList.contains("locked");
      btn.disabled = locked || S.gold < +cost;
    }
  });
}

/* ---------- 토스트 ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}
window.toast = toast;

/* ---------- 오프라인 보상 ---------- */
function offlineReward() {
  const elapsed = (Date.now() - S.lastSave) / 1000;
  if (elapsed < 90) return;
  const capped = Math.min(elapsed, 6 * 3600);
  const gain = goldPerSec() * capped * 0.6;
  const repGain = (repPerPatient() / (Math.max(brewDuration(), spawnInterval()) / 1000)) * capped * 0.6;
  if (gain < 1) return;
  S.gold += gain;
  addRep(repGain);
  const h = Math.floor(capped / 3600), mn = Math.floor((capped % 3600) / 60);
  const m = $("#genericModal");
  m.innerHTML = `
    <div class="offline-emoji">🌙→🌞</div>
    <div class="rx-head" style="border:none; padding-bottom:0; margin-bottom:6px;"><h2>약국을 지켰어요!</h2></div>
    <div class="scene-txt" style="text-align:center; line-height:1.8;">
      자리를 비운 <b>${h ? h + "시간 " : ""}${mn}분</b> 동안<br>직원들이 열심히 조제했어요.
    </div>
    <div class="reward-box">
      <div class="rw-items">
        <span class="rw-chip">💰 +${fmt(gain)}</span>
        <span class="rw-chip">⭐ +${fmt(repGain)}</span>
      </div>
    </div>
    <button class="modal-btn" onclick="document.querySelector('#genericBack').classList.remove('show')">좋았어!</button>`;
  $("#genericBack").classList.add("show");
}

/* ---------- 첫 화면 ---------- */
let pendingFirstVisitIntro = false;
let pendingOfflineReward = false;

function showFirstVisitIntro() {
  const m = $("#genericModal");
  m.innerHTML = `
    <div class="rx-head">
      <span class="ep-tag">🌌 프롤로그</span>
      <div style="width:92px; margin:2px auto 0;">${CHARS.gamin()}</div>
      <h2>가림약국 키우기</h2>
      <div class="rx-no">— 회귀약사 임가민의 사건 수첩 —</div>
    </div>
    <div class="scene-txt" style="text-align:center; line-height:1.9;">
      2024년의 베테랑 약사 임가민,<br>
      조작된 사고로 모든 걸 잃고<br>
      <b>2001년의 신입 약사로 회귀했다!</b><br><br>
      🖐️ 환자를 <b>탭</b>하면 직접 조제 (보너스!)<br>
      ⏳ 가만히 둬도 <b>자동 조제</b><br>
      ⭐ 명성을 모아 <b>긴급 사건</b>을 해결하세요<br>
      ✨ 반짝이는 환자는 <b>홀로그램 처방전</b>의 기회!
    </div>
    <button class="modal-btn" onclick="document.querySelector('#genericBack').classList.remove('show')">💊 약국 오픈!</button>`;
  $("#genericBack").classList.add("show");
}

function enterGameFromStart() {
  const start = $("#startScreen");
  if (start) start.classList.add("hide");
  if (pendingOfflineReward) {
    pendingOfflineReward = false;
    offlineReward();
  }
  if (pendingFirstVisitIntro) {
    pendingFirstVisitIntro = false;
    setTimeout(showFirstVisitIntro, 180);
  }
}

function fallbackCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "absolute";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied;
}

async function shareGame() {
  const url = location.href.split("#")[0];
  const title = "다 해먹는 2회차 동네약사";
  const text = "가림약국 키우기 바로 플레이";
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return;
    }
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    else if (!fallbackCopy(url)) throw new Error("copy failed");
    toast("공유 링크를 복사했습니다");
  } catch (e) {
    toast("공유가 취소됐거나 복사 권한이 없어요");
  }
}

function setupStartScreen(loaded) {
  const start = $("#startScreen");
  if (!start) {
    enterGameFromStart();
    return;
  }
  const continueBtn = $("#continueGameBtn");
  continueBtn.disabled = !loaded;
  continueBtn.title = loaded ? "저장된 약국으로 이어하기" : "아직 저장된 약국이 없습니다";
  $("#startGameBtn").addEventListener("click", enterGameFromStart);
  continueBtn.addEventListener("click", enterGameFromStart);
  $("#shareGameBtn").addEventListener("click", shareGame);
}

/* ---------- 메인 루프 ---------- */
let lastSpawn = 0;
let lastSpecial = Date.now();
const SPECIAL_INTERVAL = 75000; // 75초마다 특수 환자 기회

function loop(now) {
  if (now - lastSpawn > spawnInterval()) {
    lastSpawn = now;
    if (queue.length < MAX_QUEUE) {
      const dueSpecial = Date.now() - lastSpecial > SPECIAL_INTERVAL && !specialWaiting && S.clearedEvents.length >= 2;
      if (dueSpecial) { spawnPatient(true); lastSpecial = Date.now(); }
      else spawnPatient(false);
    }
  }
  tryAutoBrew();
  maybeShowStaffCameo();
  requestAnimationFrame(loop);
}

setInterval(save, 12000);
setInterval(updateHUD, 1000);
document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

/* ---------- 시작 ---------- */
function init() {
  $("#gamin").innerHTML = CHARS.gamin();
  const loaded = load();
  pendingFirstVisitIntro = !loaded;
  pendingOfflineReward = loaded;
  recalcMods();
  updateHUD();
  renderPanel();
  checkEventUnlock();
  checkAuroraUnlock();
  setupStartScreen(loaded);
  if (loaded) {
    gaminSay("다시 오셨군요. 가림약국에 어서 오세요!");
  } else {
    gaminSay("여기가… 2001년의 가림약국?");
  }
  spawnPatient(false);
  requestAnimationFrame(loop);
}

init();
