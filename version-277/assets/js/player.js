(function () {
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
  var loading = false;
  var callbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    callbacks.push(callback);
    if (loading) {
      return;
    }
    loading = true;
    var script = document.createElement("script");
    script.src = hlsUrl;
    script.onload = function () {
      loading = false;
      callbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    script.onerror = function () {
      loading = false;
      callbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    document.head.appendChild(script);
  }

  function attach(video, source, done) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      done();
      return;
    }
    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._movieHls = hls;
        done();
      } else {
        video.src = source;
        done();
      }
    });
  }

  function play(video) {
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function mount(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    if (!video || !overlay || !options.source) {
      return;
    }
    var attached = false;
    function start() {
      overlay.classList.add("is-hidden");
      if (attached) {
        play(video);
        return;
      }
      attached = true;
      attach(video, options.source, function () {
        play(video);
      });
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.MovieSitePlayer = {
    mount: mount
  };
})();
