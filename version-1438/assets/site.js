(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobileNav = document.getElementById('mobileNav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function auto() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        auto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        auto();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        auto();
      });
    });

    auto();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards(input, cards, countNode) {
    var q = normalize(input.value);
    var shown = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags'));
      var visible = !q || haystack.indexOf(q) !== -1;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });

    if (countNode) {
      countNode.textContent = q ? '找到 ' + shown + ' 个相关影片' : '精选影片';
    }
  }

  var pageFilter = document.querySelector('.page-filter');
  var pageList = document.querySelector('[data-filter-list]');

  if (pageFilter && pageList) {
    var pageCards = Array.prototype.slice.call(pageList.querySelectorAll('.movie-card'));
    pageFilter.addEventListener('input', function () {
      filterCards(pageFilter, pageCards, null);
    });
  }

  var searchInput = document.getElementById('searchInput');
  var searchList = document.querySelector('[data-search-list]');
  var searchCount = document.getElementById('searchCount');

  if (searchInput && searchList) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var searchCards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));
    searchInput.value = q;
    filterCards(searchInput, searchCards, searchCount);
    searchInput.addEventListener('input', function () {
      filterCards(searchInput, searchCards, searchCount);
    });
  }

  function attachPlayer(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');

    if (!video || !overlay) {
      return;
    }

    var url = video.getAttribute('data-video');
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function start() {
      prepare();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!prepared) {
        start();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(attachPlayer);
})();
