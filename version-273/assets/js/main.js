(function () {
    const ready = function (fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };

    ready(function () {
        const menuButton = document.querySelector('[data-menu-button]');
        const mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
            const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
            const prev = hero.querySelector('[data-hero-prev]');
            const next = hero.querySelector('[data-hero-next]');
            let current = 0;
            let timer = null;

            const show = function (index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            };

            const restart = function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            };

            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    restart();
                });
            });

            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    restart();
                });
            }

            restart();
        });

        document.querySelectorAll('[data-filter-box]').forEach(function (box) {
            const input = box.querySelector('[data-search-input]');
            const clear = box.querySelector('[data-clear-search]');
            const list = box.parentElement.querySelector('[data-search-list]') || document.querySelector('[data-search-list]');
            if (!input || !list) {
                return;
            }
            const cards = Array.from(list.querySelectorAll('[data-card]'));
            const filter = function () {
                const query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    const haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.textContent
                    ].join(' ').toLowerCase();
                    card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
                });
            };
            input.addEventListener('input', filter);
            if (clear) {
                clear.addEventListener('click', function () {
                    input.value = '';
                    filter();
                    input.focus();
                });
            }
        });

        document.querySelectorAll('[data-player]').forEach(function (player) {
            const video = player.querySelector('video');
            const button = player.querySelector('[data-player-start]');
            const playUrl = player.getAttribute('data-video-url');
            let loaded = false;

            const loadAndPlay = function () {
                if (!video || !playUrl) {
                    return;
                }
                if (!loaded) {
                    if (window.Hls && window.Hls.isSupported()) {
                        const hls = new window.Hls({
                            maxBufferLength: 60,
                            maxMaxBufferLength: 120
                        });
                        hls.loadSource(playUrl);
                        hls.attachMedia(video);
                        player.hlsInstance = hls;
                    } else {
                        video.src = playUrl;
                    }
                    loaded = true;
                }
                player.classList.add('is-playing');
                const attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            };

            if (button) {
                button.addEventListener('click', loadAndPlay);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (!loaded) {
                        loadAndPlay();
                    }
                });
            }
        });
    });
})();
