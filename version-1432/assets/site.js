(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      document.body.classList.toggle('menu-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  var heroTitle = document.querySelector('[data-hero-title]');
  var heroText = document.querySelector('[data-hero-text]');
  var heroLinks = Array.prototype.slice.call(document.querySelectorAll('[data-hero-link]'));
  var heroTags = document.querySelector('[data-hero-tags]');
  var heroFeatureImage = document.querySelector('[data-hero-feature-image]');
  var heroTextClone = document.querySelector('[data-hero-text-clone]');
  var activeSlide = 0;

  function activateHero(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });

    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('is-active', i === activeSlide);
    });

    var current = slides[activeSlide];
    if (heroTitle) {
      heroTitle.textContent = current.getAttribute('data-title') || '';
    }
    if (heroText) {
      heroText.textContent = current.getAttribute('data-text') || '';
    }
    heroLinks.forEach(function (link) {
      link.href = current.getAttribute('data-href') || '#';
    });
    if (heroTextClone) {
      heroTextClone.textContent = current.getAttribute('data-text') || '';
    }
    if (heroFeatureImage) {
      var slideImage = current.querySelector('img');
      if (slideImage) {
        heroFeatureImage.src = slideImage.getAttribute('src');
        heroFeatureImage.alt = current.getAttribute('data-title') || '';
      }
    }
    if (heroTags) {
      var tags = (current.getAttribute('data-tags') || '').split('|').filter(Boolean);
      heroTags.innerHTML = tags.map(function (tag) {
        return '<span>' + tag.replace(/[&<>"']/g, function (c) {
          return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
        }) + '</span>';
      }).join('');
    }
  }

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () {
      activateHero(index);
    });
  });

  if (slides.length) {
    activateHero(0);
    window.setInterval(function () {
      activateHero(activeSlide + 1);
    }, 5200);
  }

  function loadScript(src, callback) {
    var exists = document.querySelector('script[src="' + src + '"]');
    if (exists) {
      exists.addEventListener('load', callback);
      if (window.Hls) {
        callback();
      }
      return;
    }

    var script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-source');

    if (!video || !button || !source) {
      return;
    }

    button.addEventListener('click', function () {
      function playNow() {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({enableWorker: true});
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play();
        } else {
          video.src = source;
          video.play();
        }

        player.classList.add('is-playing');
        video.controls = true;
      }

      if (window.Hls || video.canPlayType('application/vnd.apple.mpegurl')) {
        playNow();
      } else {
        loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest', playNow);
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var qInput = filterForm.querySelector('[name="keyword"]');
    var yearSelect = filterForm.querySelector('[name="year"]');
    var regionSelect = filterForm.querySelector('[name="region"]');
    var note = document.querySelector('[data-filter-note]');

    function applyFilter() {
      var q = (qInput && qInput.value || '').trim().toLowerCase();
      var year = yearSelect && yearSelect.value || '';
      var region = regionSelect && regionSelect.value || '';
      var shown = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var ok = (!q || text.indexOf(q) !== -1) && (!year || cardYear === year) && (!region || cardRegion === region);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });

      if (note) {
        note.textContent = '当前显示 ' + shown + ' 部影片';
      }
    }

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    ['input', 'change'].forEach(function (eventName) {
      filterForm.addEventListener(eventName, applyFilter);
    });
    applyFilter();
  }

  var globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch && window.MOVIE_SEARCH_INDEX) {
    var form = globalSearch.querySelector('form');
    var input = globalSearch.querySelector('input[name="q"]');
    var resultBox = globalSearch.querySelector('[data-search-results]');
    var countBox = globalSearch.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function renderResults(query) {
      var q = query.trim().toLowerCase();
      var list = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        return !q || item.search.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 80);

      countBox.textContent = '找到 ' + list.length + ' 条结果，最多显示 80 条。';
      resultBox.innerHTML = list.map(function (item) {
        return '<article class="movie-card">'
          + '<a class="poster" href="movies/' + item.id + '.html">'
          + '<img class="card-cover" src="' + item.cover + '" alt="' + item.title + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">'
          + '<span class="poster-badge">' + item.year + '</span></a>'
          + '<div class="card-body"><div class="card-meta"><a href="category/' + item.categorySlug + '.html">' + item.categoryName + '</a><span>' + item.region + '</span></div>'
          + '<h3><a href="movies/' + item.id + '.html">' + item.title + '</a></h3>'
          + '<p>' + item.oneLine + '</p><div class="tag-row"><span>' + item.type + '</span><span>' + item.genre + '</span></div></div></article>';
      }).join('');
    }

    if (input) {
      input.value = initial;
    }
    renderResults(initial);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderResults(input.value || '');
      var next = input.value ? '?q=' + encodeURIComponent(input.value) : window.location.pathname;
      window.history.replaceState(null, '', next);
    });
  }
})();
