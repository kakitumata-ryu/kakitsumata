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

const MAX_WORDS = 9;
const LIFETIME = 15000;
let streamTimer = null;

function addWord() {
  // Keep the sky lively but bounded.
  const active = sky.querySelectorAll(".word");
  if (active.length >= MAX_WORDS) {
    active[0].remove();
  }

  const w = words[Math.floor(Math.random() * words.length)];
  const a = document.createElement("a");
  a.className = "word";
  a.href = w.h;

  const left = 4 + Math.random() * 90;
  const sway = -70 + Math.random() * 140;
  const rot = -7 + Math.random() * 14;
  const duration = 9000 + Math.random() * 6000;

  a.style.left = `${left}%`;
  a.style.setProperty("--duration", `${duration}ms`);
  a.style.setProperty("--delay", "0ms");
  a.style.setProperty("--sway", `${sway}px`);
  a.style.setProperty("--rot", `${rot}deg`);

  const span = document.createElement("span");
  span.textContent = w.t;
  span.style.fontFamily = fonts[w.f];
  a.appendChild(span);
  sky.appendChild(a);

  // Remove each word after a fixed lifetime, even if the animation is still visually subtle.
  window.setTimeout(() => {
    a.remove();
  }, LIFETIME);
}

function startStream() {
  if (streamTimer) window.clearInterval(streamTimer);
  sky.innerHTML = "";

  // Start with a small scatter, then continue dropping forever.
  for (let i = 0; i < 5; i++) {
    window.setTimeout(addWord, i * 450);
  }
  streamTimer = window.setInterval(addWord, 1200);
}

startStream();
again.addEventListener("click", startStream);
