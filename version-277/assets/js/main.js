(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOf(value) {
    return String(value || "").toLowerCase().trim();
  }

  function matchesQuery(card, query) {
    if (!query) {
      return true;
    }
    var haystack = [
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function applyFilter(scope) {
    var input = scope.querySelector(".js-filter-input");
    var year = scope.querySelector(".js-filter-year");
    var type = scope.querySelector(".js-filter-type");
    var category = scope.querySelector(".js-filter-category");
    var counter = scope.querySelector(".js-visible-count") || document.querySelector(".js-visible-count");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var queryValue = textOf(input && input.value);
    var yearValue = textOf(year && year.value);
    var typeValue = textOf(type && type.value);
    var categoryValue = textOf(category && category.value);
    var visible = 0;
    cards.forEach(function (card) {
      var ok = matchesQuery(card, queryValue);
      if (ok && yearValue) {
        ok = textOf(card.getAttribute("data-year")) === yearValue;
      }
      if (ok && typeValue) {
        ok = textOf(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
      }
      if (ok && categoryValue) {
        ok = textOf(card.getAttribute("data-category")) === categoryValue;
      }
      card.classList.toggle("is-hidden-by-filter", !ok);
      if (ok) {
        visible += 1;
      }
    });
    if (counter) {
      counter.textContent = String(visible);
    }
  }

  function initFilters() {
    var panel = document.querySelector(".filter-panel");
    if (!panel) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    var input = panel.querySelector(".js-filter-input");
    if (q && input) {
      input.value = q;
    }
    Array.prototype.slice.call(panel.querySelectorAll("input, select")).forEach(function (field) {
      field.addEventListener("input", function () {
        applyFilter(panel);
      });
      field.addEventListener("change", function () {
        applyFilter(panel);
      });
    });
    applyFilter(panel);
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
