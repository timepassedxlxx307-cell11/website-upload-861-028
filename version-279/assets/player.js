(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    window.initMoviePlayer = function (source) {
        ready(function () {
            var video = document.getElementById("moviePlayer");
            var cover = document.getElementById("playerCover");
            var shell = document.getElementById("videoShell");
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

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = source;
            }

            function startPlayback() {
                attachSource();

                if (cover) {
                    cover.classList.add("is-hidden");
                }

                var playTask = video.play();
                if (playTask && typeof playTask.catch === "function") {
                    playTask.catch(function () {
                        if (cover) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (cover) {
                cover.addEventListener("click", function (event) {
                    event.preventDefault();
                    startPlayback();
                });
            }

            if (shell) {
                shell.addEventListener("click", function (event) {
                    if (event.target === video && !attached) {
                        startPlayback();
                    }
                });
            }

            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });

            video.addEventListener("error", function () {
                if (cover && !video.currentTime) {
                    cover.classList.remove("is-hidden");
                }
            });

            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    };
})();
