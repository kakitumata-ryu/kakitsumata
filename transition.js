(function () {
  const KEY = "kakitsumata-soft-transition";

  function enter() {
    if (sessionStorage.getItem(KEY) !== "1") return;
    sessionStorage.removeItem(KEY);
    document.documentElement.classList.add("page-entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add("page-entered");
      });
    });
  }

  function leaveTo(href) {
    sessionStorage.setItem(KEY, "1");
    document.documentElement.classList.add("page-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, 980);
  }

  window.kakitsumataTransition = { enter, leaveTo };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enter, { once: true });
  } else {
    enter();
  }
})();
