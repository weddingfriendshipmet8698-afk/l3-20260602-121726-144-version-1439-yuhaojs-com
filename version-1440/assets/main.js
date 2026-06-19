(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showHero(next) {
      index = next;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        showHero(current);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showHero((index + 1) % slides.length);
      }, 5200);
    }
  }

  function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var input = root.querySelector('[data-local-search]');
    var categoryFilter = root.querySelector('[data-category-filter]');
    var sortSelect = root.querySelector('[data-sort-cards]');
    var list = root.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.children);

    function applyFilter() {
      var keyword = normalizeText(input ? input.value : '');
      var category = categoryFilter ? categoryFilter.value : '';

      cards.forEach(function (card) {
        var text = normalizeText(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-type'));
        var cardCategory = card.getAttribute('data-category') || '';
        var matchedText = !keyword || text.indexOf(keyword) !== -1;
        var matchedCategory = !category || cardCategory === category;
        card.classList.toggle('is-hidden', !(matchedText && matchedCategory));
      });
    }

    function applySort() {
      if (!sortSelect) {
        return;
      }

      var value = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }
        var av = Number(a.getAttribute('data-' + value) || 0);
        var bv = Number(b.getAttribute('data-' + value) || 0);
        return bv - av;
      });

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', applyFilter);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        applySort();
        applyFilter();
      });
    }

    var queryInput = root.querySelector('[data-query-input]');

    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        queryInput.value = q;
        applyFilter();
      }
    }
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-cover]');
    var source = player.getAttribute('data-source');
    var attached = false;
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      player.classList.add('is-started');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-started');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
