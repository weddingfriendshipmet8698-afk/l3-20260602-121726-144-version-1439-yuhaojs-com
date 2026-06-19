(function () {
  var hlsLoader = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function playVideo(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-button]');
    var source = shell.getAttribute('data-src');

    if (!video || !source) {
      return;
    }

    function startPlayback() {
      video.controls = true;
      video.play().catch(function () {});
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }
      startPlayback();
      return;
    }

    loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (!video.hlsInstance) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        }
        startPlayback();
      } else {
        if (!video.src) {
          video.src = source;
        }
        startPlayback();
      }
    }).catch(function () {
      if (!video.src) {
        video.src = source;
      }
      startPlayback();
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var overlay = shell.querySelector('[data-play-button]');
    var video = shell.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.src) {
          playVideo(shell);
        }
      });
    }
  });
})();
