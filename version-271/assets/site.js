(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupTopSearch() {
    var forms = document.querySelectorAll("[data-top-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var roots = document.querySelectorAll("[data-filter-root]");
    roots.forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var region = root.querySelector("[data-filter-region]");
      var type = root.querySelector("[data-filter-type]");
      var year = root.querySelector("[data-filter-year]");
      var grid = document.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (input && initial) {
        input.value = initial;
      }

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function run() {
        var q = valueOf(input);
        var selectedRegion = valueOf(region);
        var selectedType = valueOf(type);
        var selectedYear = valueOf(year);
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (selectedRegion && String(card.getAttribute("data-region") || "").toLowerCase() !== selectedRegion) {
            ok = false;
          }
          if (selectedType && String(card.getAttribute("data-type") || "").toLowerCase() !== selectedType) {
            ok = false;
          }
          if (selectedYear && String(card.getAttribute("data-year") || "").toLowerCase() !== selectedYear) {
            ok = false;
          }
          card.classList.toggle("is-filter-hidden", !ok);
        });
      }

      [input, region, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", run);
          element.addEventListener("change", run);
        }
      });
      run();
    });
  }

  function setupPlayer() {
    var video = document.getElementById("moviePlayer");
    var button = document.querySelector("[data-stream]");
    if (!video || !button) {
      return;
    }
    var stream = button.getAttribute("data-stream");
    var attached = false;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.__hls = hls;
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      button.classList.add("is-hidden");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
  }

  ready(function () {
    setupMenu();
    setupTopSearch();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
