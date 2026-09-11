
const allWorks = Array.isArray(window.SITE_WORKS) ? window.SITE_WORKS : [];
const sky = document.querySelector("#sky");
const note = document.querySelector("#todayText");
const again = document.querySelector("#again");

const notes = [
  "眠い。なのに書いている。",
  "作品は増える。机は片付かない。",
  "今日は何も考えたくない。でも書く。",
  "昨日の自分に何を書いたのか聞きたい。",
  "たぶん大丈夫。たぶん。"
];
if (note) note.textContent = notes[new Date().getDate() % notes.length];

const fonts = {
  serif: '"Noto Serif JP","Yu Mincho",serif',
  pop: '"Arial Black","Noto Serif JP",serif',
  brush: '"Yu Mincho","Hiragino Mincho ProN",serif'
};

const words = [];
for (const work of allWorks) {
  for (const text of (work.falling || [])) {
    words.push({ t: text, h: work._href, f: "serif", adult: !!work.adult });
  }
}

const MAX_WORDS = 12;
const FALL_TIME = 10500;
let streamTimer = null;

function addWord() {
  if (!sky) return;
  const active = [...sky.querySelectorAll(".word")];
  if (active.length >= MAX_WORDS) active[0].remove();
  if (!words.length) return;

  const w = words[Math.floor(Math.random() * words.length)];
  const a = document.createElement("a");
  a.className = "word";
  a.href = w.h || "#";
  if (w.adult) a.dataset.adult = "true";

  const left = 4 + Math.random() * 82;
  const sway = -38 + Math.random() * 76;
  const rot = -7 + Math.random() * 14;
  const scale = [0.72, 0.86, 1][Math.floor(Math.random() * 3)];

  a.style.left = `${left}%`;
  a.style.setProperty("--fall-time", `${FALL_TIME}ms`);
  a.style.setProperty("--sway", `${sway}px`);
  a.style.setProperty("--rot", `${rot}deg`);
  a.style.setProperty("--size-scale", scale);

  const span = document.createElement("span");
  span.textContent = w.t;
  span.style.fontFamily = fonts[w.f];
  a.appendChild(span);
  sky.appendChild(a);

  requestAnimationFrame(() => {
    const maxLeft = Math.max(8, sky.clientWidth - a.offsetWidth - 8);
    const targetLeft = Math.min(Math.max(8, (left / 100) * sky.clientWidth), maxLeft);
    a.style.left = `${targetLeft}px`;
  });

  window.setTimeout(() => a.remove(), FALL_TIME + 400);
}

function startStream() {
  if (!sky) return;
  if (streamTimer) window.clearInterval(streamTimer);
  sky.innerHTML = "";
  for (let i = 0; i < 5; i++) window.setTimeout(addWord, i * 700);
  streamTimer = window.setInterval(addWord, 2600);
}

function normalizeKana(s) {
  return String(s || "").replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

const filterButtons = document.querySelectorAll(".couple-filter");
const list = document.querySelector("#works-list");
const filterEmpty = document.querySelector("#filter-empty");

function renderWorks(filter = "all") {
  if (!list) return;
  const filtered = allWorks
    .filter(w => !w.adult && !w.grave)
    .filter(w => filter === "all" || w.couple === filter)
    .sort((a,b) => normalizeKana(a.reading).localeCompare(normalizeKana(b.reading), "ja"));

  list.innerHTML = filtered.map(w => {
    const tags = w.tags ? w.tags.split(",").map(s => s.trim()).filter(Boolean) : [];
    const tagHtml = tags.map(t => `<span class="work-tag">${t}</span>`).join("");
    const caution = w.caution ? `<span class="work-caution">${w.caution}</span>` : "";
    return `<a href="${w._href}" class="work">
      <span class="meta">${w.couple}</span>
      <strong>${w.title}</strong>
      <em>${w.description}</em>
      <span class="work-extra">${tagHtml}${caution}</span>
    </a>`;
  }).join("");
  if (filterEmpty) filterEmpty.hidden = filtered.length !== 0;
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach(b => {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-selected", b === button ? "true" : "false");
    });
    renderWorks(filter);
  });
});

renderWorks();
startStream();
if (again) again.addEventListener("click", startStream);
