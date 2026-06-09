(function () {
  var header = document.querySelector('[data-header]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  var menuToggle = document.querySelector('[data-menu-toggle]');

  function refreshHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 28) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  refreshHeader();
  window.addEventListener('scroll', refreshHeader, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-off');
    });
  });

  var root = document.body ? document.body.getAttribute('data-root') || '.' : '.';

  function resolvePath(path) {
    if (/^(https?:)?\/\//.test(path)) {
      return path;
    }
    if (root === '.' || root === './') {
      return './' + path.replace(/^\.\//, '');
    }
    return root.replace(/\/$/, '') + '/' + path.replace(/^\.\//, '');
  }

  function coverPath(number) {
    return resolvePath(String(number) + '.jpg');
  }

  document.querySelectorAll('[data-global-search-form]').forEach(function (form) {
    var input = form.querySelector('[data-site-search]');
    var panel = form.querySelector('[data-search-results]');
    if (!input || !panel) {
      return;
    }

    function renderResults() {
      var query = input.value.trim().toLowerCase();
      if (!query || !window.SITE_SEARCH_DATA) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }
      var hits = window.SITE_SEARCH_DATA.filter(function (item) {
        return item.text.indexOf(query) !== -1;
      }).slice(0, 10);
      if (!hits.length) {
        panel.classList.add('is-open');
        panel.innerHTML = '<div class="search-hit"><div></div><div><strong>没有匹配内容</strong><small>换一个关键词试试</small></div></div>';
        return;
      }
      panel.innerHTML = hits.map(function (item) {
        return '<a class="search-hit" href="' + resolvePath(item.url) + '">' +
          '<img src="' + coverPath(item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<span><strong>' + item.title + '</strong><small>' + item.meta + '</small></span>' +
          '</a>';
      }).join('');
      panel.classList.add('is-open');
      panel.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
          image.classList.add('image-off');
        });
      });
    }

    input.addEventListener('input', renderResults);
    input.addEventListener('focus', renderResults);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var first = panel.querySelector('a');
      if (first) {
        window.location.href = first.href;
      }
    });
    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var tabs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-tab]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      tabs.forEach(function (tab, tabIndex) {
        tab.classList.toggle('is-active', tabIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        show(Number(tab.getAttribute('data-hero-tab')) || 0);
        start();
      });
    });
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var filterInput = document.querySelector('[data-page-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyPageFilter() {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear.indexOf(year) !== -1);
      card.classList.toggle('card-hidden', !matched);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyPageFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyPageFilter);
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var loaded = false;
    var instance = null;

    function loadVideo() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            lowLatencyMode: true,
            maxBufferLength: 30,
            enableWorker: true
          });
          instance.loadSource(stream);
          instance.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }
      player.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', loadVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          loadVideo();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
  });
})();
