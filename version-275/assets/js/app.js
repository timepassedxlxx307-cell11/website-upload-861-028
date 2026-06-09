(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener('click', function () {
            links.classList.toggle('is-open');
            document.body.classList.toggle('nav-open', links.classList.contains('is-open'));
        });
        links.addEventListener('click', function (event) {
            if (event.target.tagName === 'A') {
                links.classList.remove('is-open');
                document.body.classList.remove('nav-open');
            }
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-movie-grid]');
        if (!panel || !grid) {
            return;
        }
        var search = panel.querySelector('[data-movie-search]');
        var type = panel.querySelector('[data-filter-type]');
        var region = panel.querySelector('[data-filter-region]');
        var year = panel.querySelector('[data-filter-year]');
        var count = panel.querySelector('[data-filter-count]');
        var empty = document.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && search) {
            search.value = initialQuery;
        }

        function includes(card, attribute, value) {
            if (!value) {
                return true;
            }
            return (card.getAttribute(attribute) || '').toLowerCase().indexOf(value.toLowerCase()) !== -1;
        }

        function apply() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var typeValue = type ? type.value : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;
                if (query && cardText(card).indexOf(query) === -1) {
                    matched = false;
                }
                if (matched && !includes(card, 'data-type', typeValue)) {
                    matched = false;
                }
                if (matched && !includes(card, 'data-region', regionValue)) {
                    matched = false;
                }
                if (matched && !includes(card, 'data-year', yearValue)) {
                    matched = false;
                }
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, type, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function attachVideo(video, source) {
        if (video.getAttribute('data-bound') === 'true') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = source;
        }
        video.setAttribute('data-bound', 'true');
    }

    function initPlayer() {
        var player = document.querySelector('[data-player]');
        if (!player) {
            return;
        }
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-source');
        if (!video || !source) {
            return;
        }

        function play() {
            attachVideo(video, source);
            player.classList.add('is-playing');
            if (button) {
                button.hidden = true;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                    if (button) {
                        button.hidden = false;
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
            if (button) {
                button.hidden = true;
            }
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                player.classList.remove('is-playing');
                if (button) {
                    button.hidden = false;
                }
            }
        });
    }

    function markActiveNav() {
        var current = window.location.pathname.split('/').pop() || 'index.html';
        Array.prototype.forEach.call(document.querySelectorAll('.nav-links a'), function (link) {
            var href = link.getAttribute('href') || '';
            if (href.split('/').pop() === current) {
                link.classList.add('is-active');
            }
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayer();
        markActiveNav();
    });
}());
