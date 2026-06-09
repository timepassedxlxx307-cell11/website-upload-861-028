async function attachHls(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return null;
    }

    var module = await import("./hls.js");
    var Hls = module.H;
    if (!Hls || !Hls.isSupported()) {
        video.src = source;
        return null;
    }

    var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    return hls;
}

function setupPlayer(shell) {
    var video = shell.querySelector("video[data-src]");
    var button = shell.querySelector("[data-play-button]");
    var status = shell.querySelector("[data-player-status]");
    var hlsInstance = null;
    var started = false;

    async function play() {
        if (!video) {
            return;
        }

        var source = video.dataset.src;
        if (!source) {
            if (status) {
                status.textContent = "播放源暂不可用";
            }
            return;
        }

        if (started) {
            video.play();
            return;
        }

        started = true;
        shell.classList.add("is-playing");
        if (status) {
            status.textContent = "正在加载高清播放源";
        }

        try {
            hlsInstance = await attachHls(video, source);
            await video.play();
            if (status) {
                status.textContent = "正在播放";
            }
        } catch (error) {
            started = false;
            shell.classList.remove("is-playing");
            if (status) {
                status.textContent = "播放被浏览器拦截，请再次点击播放";
            }
        }
    }

    if (button) {
        button.addEventListener("click", play);
    }

    shell.addEventListener("click", function (event) {
        if (event.target === video) {
            return;
        }
        if (!started) {
            play();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
}

document.querySelectorAll("[data-player]").forEach(setupPlayer);
