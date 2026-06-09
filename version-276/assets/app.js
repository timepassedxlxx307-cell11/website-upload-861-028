(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });

      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var typeSelect = document.querySelector('[data-filter-select="type"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function applyFilter() {
      if (!cards.length) {
        return;
      }

      var query = normalize(filterInputs.map(function (input) {
        return input.value;
      }).join(' '));
      var typeValue = normalize(typeSelect ? typeSelect.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var typeText = normalize(card.getAttribute('data-type'));
        var matchedText = !query || text.indexOf(query) !== -1;
        var matchedType = !typeValue || typeText.indexOf(typeValue) !== -1;
        var visible = matchedText && matchedType;
        card.classList.toggle('is-hidden', !visible);

        if (visible) {
          visibleCount += 1;
        }
      });

      var grid = cards[0] ? cards[0].parentElement : null;
      var empty = document.querySelector('[data-empty-result]');

      if (grid && !empty) {
        empty = document.createElement('div');
        empty.className = 'no-result is-hidden';
        empty.setAttribute('data-empty-result', 'true');
        empty.textContent = '没有找到匹配影片';
        grid.appendChild(empty);
      }

      if (empty) {
        empty.classList.toggle('is-hidden', visibleCount !== 0);
      }
    }

    filterInputs.forEach(function (input) {
      input.addEventListener('input', applyFilter);
    });

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-cover');
      var stream = player.getAttribute('data-stream');
      var hlsInstance = null;

      function attachStream() {
        if (!video || !stream || video.dataset.ready === 'true') {
          return;
        }

        video.dataset.ready = 'true';

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function playVideo() {
        attachStream();

        if (!video) {
          return;
        }

        player.classList.add('playing');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('playing');
        });

        video.addEventListener('pause', function () {
          player.classList.remove('playing');
        });

        video.addEventListener('click', function () {
          if (video.paused) {
            playVideo();
          }
        });

        video.addEventListener('error', function () {
          player.classList.remove('playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
