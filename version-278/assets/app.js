(function () {
    function closestScope(node) {
        return node.closest('[data-filter-scope]') || document;
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var menu = document.querySelector('[data-nav-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupFilters() {
        var inputs = document.querySelectorAll('[data-filter-input]');
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                var value = normalize(input.value);
                var scope = closestScope(input);
                var cards = scope.querySelectorAll('[data-card]');
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
                });
            });
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
        var previous = carousel.querySelector('[data-slide-prev]');
        var next = carousel.querySelector('[data-slide-next]');
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
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
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

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupNavigation();
        setupFilters();
        setupCarousel();
    });
})();
