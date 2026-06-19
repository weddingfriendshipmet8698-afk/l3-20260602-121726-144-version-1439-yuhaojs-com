(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", mobileMenu.classList.contains("is-open"));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var yearSelect = scope.querySelector("[data-filter-year]");
        var typeSelect = scope.querySelector("[data-filter-type]");
        var container = scope.parentElement || document;
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (input && query) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var yearMatched = !year || card.getAttribute("data-year") === year;
                var typeMatched = !type || card.getAttribute("data-type") === type;
                var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle("is-hidden", !(yearMatched && typeMatched && keywordMatched));
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }

        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilter);
        }

        applyFilter();
    });
})();
