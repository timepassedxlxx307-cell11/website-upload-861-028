(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.tags,
            card.textContent
        ].join(" "));
    }

    function filterCards(query, tag) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!cards.length) {
            return false;
        }

        var normalizedQuery = normalize(query);
        var normalizedTag = normalize(tag === "all" ? "" : tag);
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = cardText(card);
            var queryMatched = !normalizedQuery || text.indexOf(normalizedQuery) !== -1;
            var tagMatched = !normalizedTag || text.indexOf(normalizedTag) !== -1;
            var visible = queryMatched && tagMatched;
            card.hidden = !visible;
            if (visible) {
                visibleCount += 1;
            }
        });

        var empty = document.querySelector("[data-empty-state]");
        if (empty) {
            empty.hidden = visibleCount !== 0;
        }
        return true;
    }

    function setupSearch() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var inputs = document.querySelectorAll("[data-search-input]");
        inputs.forEach(function (input) {
            input.value = q;
        });
        if (q) {
            filterCards(q, "all");
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("[data-search-input]");
                var value = input ? input.value : "";
                if (filterCards(value, "all")) {
                    event.preventDefault();
                    var url = new URL(window.location.href);
                    if (value) {
                        url.searchParams.set("q", value);
                    } else {
                        url.searchParams.delete("q");
                    }
                    window.history.replaceState(null, "", url.toString());
                }
            });
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter]").forEach(function (button) {
            button.addEventListener("click", function () {
                var parent = button.closest("[data-filter-bar]");
                if (parent) {
                    parent.querySelectorAll("[data-filter]").forEach(function (item) {
                        item.classList.remove("active");
                    });
                }
                button.classList.add("active");
                var input = document.querySelector("[data-search-input]");
                filterCards(input ? input.value : "", button.dataset.filter);
            });
        });
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-main-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            slides[index].classList.remove("is-active");
            index = (nextIndex + slides.length) % slides.length;
            slides[index].classList.add("is-active");
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 4800);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        var next = document.querySelector("[data-hero-next]");
        var prev = document.querySelector("[data-hero-prev]");
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        start();
    }

    ready(function () {
        setupMenu();
        setupSearch();
        setupFilters();
        setupHero();
    });
}());
