const words = [
  { t:"親父が変だ。最近。", h:"works/kashima3.html", f:"serif" },
  { t:"なんややなくて。みてぇコレ", h:"works/kasa.html", f:"pop" },
  { t:"冷麺はまだ食べてはいけない。", h:"works/reimen.html", f:"serif" },
  { t:"見えない。", h:"works/kashima3.html", f:"brush" },
  { t:"たぶん、もう船は出る。", h:"works/kasa.html", f:"serif" },
  { t:"酒が足りねぇ", h:"works/kasa.html", f:"pop" },
  { t:"どうしてこうなった。", h:"works/reimen.html", f:"brush" }
];

const notes = [
  "眠い。なのに書いている。",
  "作品は増える。机は片付かない。",
  "今日は何も考えたくない。でも書く。",
  "昨日の自分に何を書いたのか聞きたい。",
  "たぶん大丈夫。たぶん。"
];

const sky = document.querySelector("#sky");
const note = document.querySelector("#todayText");
const again = document.querySelector("#again");

note.textContent = notes[new Date().getDate() % notes.length];

const fonts = {
  serif: '"Noto Serif JP","Yu Mincho",serif',
  pop: '"Arial Black","Noto Serif JP",serif',
  brush: '"Yu Mincho","Hiragino Mincho ProN",serif'
};

const MAX_WORDS = 18;
const FALL_TIME = 8500;
const REST_TIME = 18000;
let streamTimer = null;

function addWord() {
  const active = [...sky.querySelectorAll(".word")];

  // Keep a small pile rather than endlessly filling the screen.
  if (active.length >= MAX_WORDS) {
    active[0].classList.add("fading");
    window.setTimeout(() => active[0]?.remove(), 900);
  }

  const w = words[Math.floor(Math.random() * words.length)];
  const a = document.createElement("a");
  a.className = "word";
  a.href = w.h;

  const left = 4 + Math.random() * 82;
  const sway = -38 + Math.random() * 76;
  const rot = -7 + Math.random() * 14;

  // Each new word gets its own landing height, so they gently pile up.
  const pile = sky.querySelectorAll(".word").length;
  const pileOffset = Math.min(pile * 22, Math.max(0, sky.clientHeight - 90));
  const land = Math.max(40, sky.clientHeight - 65 - pileOffset + Math.random() * 18);

  a.style.left = `${left}%`;
  a.style.setProperty("--fall-time", `${FALL_TIME}ms`);
  a.style.setProperty("--land", `${land}px`);
  a.style.setProperty("--sway", `${sway}px`);
  a.style.setProperty("--rot", `${rot}deg`);
  a.style.setProperty("--rest", `${REST_TIME}ms`);

  const span = document.createElement("span");
  span.textContent = w.t;
  span.style.fontFamily = fonts[w.f];
  a.appendChild(span);
  sky.appendChild(a);

  // Keep long phrases fully inside the viewport instead of clipping at the sides.
  requestAnimationFrame(() => {
    const maxLeft = Math.max(8, sky.clientWidth - a.offsetWidth - 8);
    const targetLeft = Math.min(Math.max(8, (left / 100) * sky.clientWidth), maxLeft);
    a.style.left = `${targetLeft}px`;
  });

  // Let it remain in the pile for a while, then quietly disappear.
  window.setTimeout(() => {
    a.classList.add("fading");
    window.setTimeout(() => a.remove(), 900);
  }, FALL_TIME + REST_TIME);
}

function startStream() {
  if (streamTimer) window.clearInterval(streamTimer);
  sky.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    window.setTimeout(addWord, i * 700);
  }
  streamTimer = window.setInterval(addWord, 2200);
}

startStream();
again.addEventListener("click", startStream);
