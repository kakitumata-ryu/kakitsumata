document.addEventListener("DOMContentLoaded", () => {
  const all = Array.isArray(window.records) ? window.records : (typeof records !== "undefined" ? records : []);
  const container =
    document.querySelector("#works-list") ||
    document.querySelector("#works-grid") ||
    document.querySelector(".works-grid") ||
    document.querySelector(".works-list");

  const filterButtons = [...document.querySelectorAll("[data-couple]")];

  const clean = v => (v == null ? "" : String(v));
  const isTrue = v => v === true || v === "はい" || v === "Yes" || v === "TRUE" || v === "true" || v === "1";

  function eligible(r) {
    return !isTrue(r.grave) && !isTrue(r.adult);
  }

  function sortWorks(list) {
    return [...list].sort((a,b) =>
      clean(a.reading || a.title).localeCompare(clean(b.reading || b.title), "ja")
    );
  }

  function esc(s) {
    return clean(s).replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[ch]));
  }

  function render(couple = "すべて") {
    if (!container) return;
    let list = all.filter(eligible);
    if (couple !== "すべて") {
      list = list.filter(r => clean(r.couple) === couple);
    }
    list = sortWorks(list);

    if (!list.length) {
      container.innerHTML = '<p class="empty">この条件の作品は、まだありません。</p>';
      return;
    }

    container.innerHTML = list.map(r => {
      const href = r._href ? clean(r._href) : "#";
      const tags = clean(r.tags) ? `<div class="work-tags">${esc(r.tags)}</div>` : "";
      const caution = clean(r.caution) ? `<p class="work-caution">${esc(r.caution)}</p>` : "";
      return `<article class="work-card">
        <div class="work-meta">${esc(r.couple)}</div>
        <h2><a href="${href}">${esc(r.title)}</a></h2>
        ${clean(r.description) ? `<p>${esc(r.description)}</p>` : ""}
        ${tags}
        ${caution}
      </article>`;
    }).join("");
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      render(clean(btn.dataset.couple) || "すべて");
    });
  });

  render("すべて");

  // Falling words: exclude graveyard; adult entries route through the warning.
  const fallingContainer =
    document.querySelector("#falling-words") ||
    document.querySelector(".falling-words");
  if (fallingContainer) {
    const pool = all.filter(r => !isTrue(r.grave) && Array.isArray(r.falling) && r.falling.some(Boolean));
    fallingContainer.innerHTML = "";
    pool.forEach(r => {
      r.falling.filter(Boolean).forEach(text => {
        const span = document.createElement("span");
        span.textContent = text;
        span.style.setProperty("--size-scale", [0.72,0.86,1][Math.floor(Math.random()*3)]);
        if (isTrue(r.adult)) {
          span.classList.add("adult-falling");
          span.addEventListener("click", () => {
            location.href = `adult-warning.html?id=${encodeURIComponent(r.id)}`;
          });
        } else if (r._href) {
          span.addEventListener("click", () => { location.href = r._href; });
        }
        fallingContainer.appendChild(span);
      });
    });
  }
});
