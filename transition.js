(function () {
  const KEY = "kakitsumata-soft-transition";

  function enter() {
    if (sessionStorage.getItem(KEY) !== "1") return;
    sessionStorage.removeItem(KEY);

    document.documentElement.classList.add("page-entering");

    // 新しいページをまずぼやけた状態で見せて、
    // その上からピントが戻る。
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add("page-entered");
      });
    });
  }

  function leaveTo(href, delay = 520) {
    sessionStorage.setItem(KEY, "1");
    document.documentElement.classList.add("page-leaving");

    // 前ページのぼかしが深くなったところで移動。
    window.setTimeout(() => {
      window.location.href = href;
    }, delay);
  }

  window.kakitsumataTransition = { enter, leaveTo };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enter, { once: true });
  } else {
    enter();
  }
})();
