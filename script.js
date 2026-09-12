document.addEventListener("DOMContentLoaded", () => {
  const allWorks = Array.isArray(window.records) ? window.records : [];

  const sky = document.querySelector("#sky");
  const again = document.querySelector("#again");
  const note = document.querySelector("#todayText");

  if (note) {
    fetch("texts/memo.txt", { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error("memo.txt not found"); return r.text(); })
      .then(text => {
        note.textContent = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
      })
      .catch(() => {
        note.textContent = "メモを読み込めませんでした。";
      });
  }

  const toHira = s => String(s || "").replace(/[ァ-ヶ]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
  const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
  const isTrue = v => v === true || ["はい","Yes","TRUE","true","1"].includes(String(v));
  const canonicalHref = w => {
    const id = String(w.id).padStart(3, "0");
    return isTrue(w.adult) ? `works/adult/${id}.html` : `works/${id}.html`;
  };

  // ---------- Falling words ----------
  if (sky) {
    const pool = allWorks.filter(w => !isTrue(w.grave) && Array.isArray(w.falling) && w.falling.some(Boolean));
    let timer;

    function spawn() {
      if (!pool.length) return;
      const w = pool[Math.floor(Math.random() * pool.length)];
      const candidates = w.falling.filter(Boolean);
      const text = candidates[Math.floor(Math.random() * candidates.length)];

      const a = document.createElement("a");
      a.className = "word";
      const destination = isTrue(w.adult)
        ? `adult-warning.html?id=${encodeURIComponent(w.id)}`
        : canonicalHref(w);
      a.href = destination;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        if (a.classList.contains("word-selected")) return;

        a.classList.add("word-selected");
        if (window.kakitsumataChime) window.kakitsumataChime();

        // 波紋と音の余韻を先に見せる。その後、1回だけ滑らかにぼかして遷移。
        window.setTimeout(() => {
          if (window.kakitsumataTransition) {
            window.kakitsumataTransition.leaveTo(destination);
          } else {
            window.setTimeout(() => { window.location.href = destination; }, 760);
          }
        }, 1250);
      });

      a.style.left = `${4 + Math.random() * 82}%`;
      a.style.setProperty("--fall-time", `${9300 + Math.random() * 2600}ms`);
      a.style.setProperty("--sway", `${-42 + Math.random() * 84}px`);
      a.style.setProperty("--rot", `${-7 + Math.random() * 14}deg`);
      a.style.setProperty("--size-scale", [0.72, 0.86, 1][Math.floor(Math.random()*3)]);

      const span = document.createElement("span");
      span.textContent = text;
      a.appendChild(span);
      sky.appendChild(a);

      setTimeout(() => a.remove(), 12500);
    }

    function startFalling() {
      clearInterval(timer);
      sky.innerHTML = "";
      for (let i = 0; i < 5; i++) setTimeout(spawn, i * 350);
      timer = setInterval(spawn, 1500);
    }

    startFalling();
    if (again) again.addEventListener("click", startFalling);
  }

  // ---------- Normal work list ----------
  const list = document.querySelector("#works-list");
  const empty = document.querySelector("#filter-empty");
  const buttons = [...document.querySelectorAll(".couple-filter")];

  function renderWorks(filter = "all") {
    if (!list) return;

    const rows = allWorks
      .filter(w => !isTrue(w.adult) && !isTrue(w.grave))
      .filter(w => filter === "all" || w.couple === filter)
      .sort((a,b) => toHira(a.reading).localeCompare(toHira(b.reading), "ja"));

    list.innerHTML = rows.map(w => {
      const tags = String(w.tags || "")
        .split(/[,\u3001]/)
        .map(v => v.trim())
        .filter(Boolean)
        .map(v => `<span class="work-tag">${esc(v)}</span>`)
        .join("");
      const caution = w.caution
        ? `<span class="work-caution">${esc(w.caution)}</span>`
        : "";
      const extra = (tags || caution)
        ? `<span class="work-extra">${tags}${caution}</span>`
        : "";

      return `
      <a href="${esc(canonicalHref(w))}" class="work">
        <span class="meta">${esc(w.couple)}</span>
        <strong>${esc(w.title)}</strong>
        <em>${esc(w.description || "")}</em>
        ${extra}
      </a>`;
    }).join("");

    if (empty) empty.hidden = rows.length > 0;
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      renderWorks(btn.dataset.filter || "all");
    });
  });

  renderWorks();
});
