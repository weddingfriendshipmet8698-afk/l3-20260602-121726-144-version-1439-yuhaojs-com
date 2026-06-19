(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = index;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = Number(dot.getAttribute('data-hero-dot'));
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function() {
                showSlide((current + 1) % slides.length);
            }, 5000);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(input, list, extraValue) {
        var keyword = normalize(input.value);
        var extra = normalize(extraValue);
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));
        cards.forEach(function(card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags')
            ].join(' '));
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedExtra = !extra || haystack.indexOf(extra) !== -1;
            card.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedExtra));
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function(form) {
        var input = form.querySelector('input');
        var list = document.querySelector('[data-card-list]');
        if (!input || !list) {
            return;
        }
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            filterCards(input, list, '');
        });
        input.addEventListener('input', function() {
            filterCards(input, list, '');
        });
    });

    var searchPanel = document.querySelector('[data-search-panel]');
    var searchResults = document.querySelector('[data-search-results]');
    if (searchPanel && searchResults) {
        var keywordInput = searchPanel.querySelector('input[name="q"]');
        var regionSelect = searchPanel.querySelector('select[name="region"]');
        var categorySelect = searchPanel.querySelector('select[name="category"]');
        var params = new URLSearchParams(window.location.search);
        if (params.get('q')) {
            keywordInput.value = params.get('q');
        }

        function runSearch() {
            var extra = [regionSelect.value, categorySelect.value].filter(Boolean).join(' ');
            filterCards(keywordInput, searchResults, extra);
        }

        searchPanel.addEventListener('submit', function(event) {
            event.preventDefault();
            runSearch();
        });
        keywordInput.addEventListener('input', runSearch);
        regionSelect.addEventListener('change', runSearch);
        categorySelect.addEventListener('change', runSearch);
        runSearch();
    }
}());
