(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
                document.body.classList.toggle("nav-open", mobileNav.classList.contains("open"));
            });
        }

        var hero = document.querySelector("[data-hero-carousel]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });

            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        var searchInput = document.querySelector("[data-search-input]");
        var channelButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-channel]"));
        var sortSelect = document.querySelector("[data-sort-select]");
        var list = document.querySelector("[data-card-list]");
        var emptyState = document.querySelector("[data-empty-state]");
        var activeChannel = "all";

        function cards() {
            var scope = list || document;
            return Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        }

        function filterCards() {
            var query = normalize(searchInput ? searchInput.value : "");
            var visible = 0;

            cards().forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search-text"));
                var channel = card.getAttribute("data-channel") || "";
                var channelMatch = activeChannel === "all" || channel === activeChannel;
                var searchMatch = !query || searchText.indexOf(query) !== -1;
                var shouldShow = channelMatch && searchMatch;
                card.style.display = shouldShow ? "" : "none";
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");
            if (initialQuery) {
                searchInput.value = initialQuery;
            }
            searchInput.addEventListener("input", filterCards);
        }

        channelButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeChannel = button.getAttribute("data-filter-channel") || "all";
                channelButtons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                filterCards();
            });
        });

        if (sortSelect && list) {
            sortSelect.addEventListener("change", function () {
                var mode = sortSelect.value;
                var sorted = cards().sort(function (a, b) {
                    if (mode === "new") {
                        return (Number(b.getAttribute("data-year")) || 0) - (Number(a.getAttribute("data-year")) || 0);
                    }
                    if (mode === "hot") {
                        return (Number(b.getAttribute("data-views")) || 0) - (Number(a.getAttribute("data-views")) || 0);
                    }
                    return (a.getAttribute("href") || "").localeCompare(b.getAttribute("href") || "");
                });
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
                filterCards();
            });
        }

        if (searchInput || channelButtons.length || sortSelect) {
            filterCards();
        }
    });
})();
