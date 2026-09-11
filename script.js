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

const MAX_WORDS = 12;
const FALL_TIME = 10500;
let streamTimer = null;

function addWord() {
  const active = [...sky.querySelectorAll(".word")];
  if (active.length >= MAX_WORDS) {
    active[0].remove();
  }

  const w = words[Math.floor(Math.random() * words.length)];
  const a = document.createElement("a");
  a.className = "word";
  a.href = w.h;

  const left = 4 + Math.random() * 82;
  const sway = -38 + Math.random() * 76;
  const rot = -7 + Math.random() * 14;

  a.style.left = `${left}%`;
  a.style.setProperty("--fall-time", `${FALL_TIME}ms`);
  a.style.setProperty("--sway", `${sway}px`);
  a.style.setProperty("--rot", `${rot}deg`);

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

  // Let it continue past the bottom edge before removing it.
  window.setTimeout(() => a.remove(), FALL_TIME + 400);
}

function startStream() {
  if (streamTimer) window.clearInterval(streamTimer);
  sky.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    window.setTimeout(addWord, i * 700);
  }
  streamTimer = window.setInterval(addWord, 2600);
}

startStream();
again.addEventListener("click", startStream);


const filterButtons = document.querySelectorAll(".couple-filter");
const workCards = document.querySelectorAll("#works-list .work");
const filterEmpty = document.querySelector("#filter-empty");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach(b => {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-selected", b === button ? "true" : "false");
    });

    let visible = 0;
    workCards.forEach(card => {
      const show = filter === "all" || card.dataset.couple === filter;
      card.hidden = !show;
      if (show) visible++;
    });

    filterEmpty.hidden = visible !== 0;
  });
});
