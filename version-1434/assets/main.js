(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-goto]'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    var prev = carousel.querySelector('[data-prev]');
    var next = carousel.querySelector('[data-next]');
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
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-goto')) || 0);
        restart();
      });
    });
    show(0);
    start();
  });

  function initVideo(video) {
    if (!video || video.dataset.ready === '1') {
      return;
    }
    var src = video.getAttribute('data-video-src');
    if (!src) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.dataset.ready = '1';
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = '1';
    } else {
      video.src = src;
      video.dataset.ready = '1';
    }
  }

  var players = document.querySelectorAll('[data-player]');
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var layer = box.querySelector('.play-layer');
    if (layer && video) {
      layer.addEventListener('click', function () {
        initVideo(video);
        layer.classList.add('hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            layer.classList.remove('hidden');
          });
        }
      });
    }
  });

  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var searchSummary = document.getElementById('searchSummary');
  if (searchInput && searchResults && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;

    function render(query) {
      var q = query.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (!q) {
        searchSummary.textContent = '输入关键词后显示结果';
        return;
      }
      var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var pool = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        return pool.indexOf(q) !== -1;
      }).slice(0, 120);
      searchSummary.textContent = '找到 ' + results.length + ' 条相关结果';
      var html = results.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + item.href + '">',
          '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '    <span class="type-badge">' + escapeHtml(item.type) + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <h2><a href="' + item.href + '">' + escapeHtml(item.title) + '</a></h2>',
          '    <p>' + escapeHtml(item.oneLine) + '</p>',
          '    <div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
      searchResults.innerHTML = html;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }

    searchInput.addEventListener('input', function () {
      render(searchInput.value);
    });
    render(initial);
  }
}());
