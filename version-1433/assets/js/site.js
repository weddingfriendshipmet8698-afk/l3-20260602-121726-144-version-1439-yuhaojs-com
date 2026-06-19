(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;
    var heroTimer = null;

    function showHeroSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer || slides.length < 2) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showHeroSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
            showHeroSlide(index);
            if (heroTimer) {
                window.clearInterval(heroTimer);
                heroTimer = null;
                startHeroTimer();
            }
        });
    });

    showHeroSlide(0);
    startHeroTimer();

    var filterPanel = document.querySelector('[data-filter-panel]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterPanel && filterList) {
        var filterInput = filterPanel.querySelector('[data-filter-input]');
        var filterCategory = filterPanel.querySelector('[data-filter-category]');
        var filterYear = filterPanel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';

        if (filterInput && queryValue) {
            filterInput.value = queryValue;
        }

        function applyFilters() {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var category = filterCategory ? filterCategory.value : '';
            var year = filterYear ? filterYear.value : '';

            cards.forEach(function (card) {
                var search = card.getAttribute('data-search') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
                var matchedCategory = !category || cardCategory === category;
                var matchedYear = !year || cardYear === year;

                card.classList.toggle('is-hidden', !(matchedKeyword && matchedCategory && matchedYear));
            });
        }

        if (filterInput) {
            filterInput.addEventListener('input', applyFilters);
        }

        if (filterCategory) {
            filterCategory.addEventListener('change', applyFilters);
        }

        if (filterYear) {
            filterYear.addEventListener('change', applyFilters);
        }

        applyFilters();
    }
})();

function initPlayer(source) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var prepared = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function prepareVideo() {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function playVideo() {
        prepareVideo();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;
        var request = video.play();

        if (request && request.catch) {
            request.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
