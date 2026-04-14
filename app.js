const intro = document.getElementById("intro");
const portal = document.getElementById("portal");
const enterBtn = document.getElementById("enterBtn");
const main = document.getElementById("main");
const yearEl = document.getElementById("year");

if (yearEl) yearEl.textContent = new Date().getFullYear();

const params = new URLSearchParams(window.location.search);
const shouldSkipIntroByUrl = params.get("skipIntro") === "1";
const introSeenInSession = sessionStorage.getItem("valentioIntroSeen") === "1";
const shouldSkipIntro = shouldSkipIntroByUrl || introSeenInSession;

function unlockMain() {
    if (!main) return;
    main.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "";
}

function removeIntro() {
    if (!intro) return;
    intro.style.display = "none";
    intro.setAttribute("aria-hidden", "true");
}

function cleanSkipIntroFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("skipIntro");
    const finalUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, document.title, finalUrl);
}

if (shouldSkipIntro) {
    unlockMain();
    removeIntro();
    cleanSkipIntroFromUrl();
} else {
    document.body.style.overflow = "hidden";
}

const playerEl = document.getElementById("musicPlayer");
const trackTitleEl = document.getElementById("trackTitle");
const trackArtistEl = document.getElementById("trackArtist");
const trackIndexEl = document.getElementById("trackIndex");
const timeCurEl = document.getElementById("timeCur");
const timeDurEl = document.getElementById("timeDur");
const seekEl = document.getElementById("seek");
const volEl = document.getElementById("vol");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const openQueueBtn = document.getElementById("openQueueBtn");
const closeQueueBtn = document.getElementById("closeQueueBtn");
const queuePanel = document.getElementById("queuePanel");
const queueEl = document.getElementById("queue");

const TRACKS = [
    { title: "Seasons", artist: "Wave to earth", src: "assets/music/track01.mp3" },
    { title: "Homesick", artist: "Wave to earth", src: "assets/music/track02.mp3" },
    { title: "Summer, night", artist: "Wave to earth", src: "assets/music/track03.mp3" },
    { title: "Who knows", artist: "Daniel Caesar", src: "assets/music/track04.mp3" },
    { title: "Afterlife", artist: "d4vd", src: "assets/music/track05.mp3" },
    { title: "One more dance", artist: "d4vd", src: "assets/music/track06.mp3" },
    { title: "annie.", artist: "Wave to earth", src: "assets/music/track07.mp3" },
    { title: "Daisies", artist: "ARTIST", src: "assets/music/track08.mp3" },
    { title: "Rearrange My World", artist: "Daniel Caesar", src: "assets/music/track09.mp3" },
    { title: "I don't know you anymore", artist: "Sombr", src: "assets/music/track10.mp3" },
    { title: "Happy w u", artist: "Arthur Nery", src: "assets/music/track11.mp3" },
    { title: "Understand", artist: "Keshi", src: "assets/music/track12.mp3" },
];

const audio = new Audio();
audio.preload = "metadata";
audio.loop = false;

let currentIndex = 0;
let isUserSeeking = false;
let resumeMusicListenersAttached = false;

function fmtTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function renderQueue() {
    if (!queueEl) return;

    queueEl.innerHTML = "";

    TRACKS.forEach((track, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "qitem";
        item.dataset.idx = String(index);
        item.innerHTML = `
            <div class="qitem__t">${track.title}</div>
            <div class="qitem__a">${track.artist}</div>
        `;
        item.addEventListener("click", () => loadTrack(index, true));
        queueEl.appendChild(item);
    });
}

function setActiveQueue() {
    if (!queueEl) return;

    const items = queueEl.querySelectorAll(".qitem");
    items.forEach((el) => {
        const idx = Number(el.dataset.idx);
        el.classList.toggle("is-active", idx === currentIndex);
    });
}

function setUIForTrack() {
    const track = TRACKS[currentIndex];
    if (trackTitleEl) trackTitleEl.textContent = track.title;
    if (trackArtistEl) trackArtistEl.textContent = track.artist;
    if (trackIndexEl) trackIndexEl.textContent = `${currentIndex + 1}/${TRACKS.length}`;
    setActiveQueue();
}

function loadTrack(index, autoplay = false) {
    currentIndex = (index + TRACKS.length) % TRACKS.length;
    const track = TRACKS[currentIndex];

    audio.src = track.src;
    setUIForTrack();

    if (seekEl) seekEl.value = "0";
    if (timeCurEl) timeCurEl.textContent = "0:00";
    if (timeDurEl) timeDurEl.textContent = "0:00";
    if (playBtn) playBtn.textContent = "▶";

    if (autoplay) {
        tryAutoplay();
    }
}

function cleanupResumeListeners() {
    if (!resumeMusicListenersAttached) return;
    document.removeEventListener("click", resumeMusicOnFirstInteraction, true);
    document.removeEventListener("keydown", resumeMusicOnFirstInteraction, true);
    document.removeEventListener("touchstart", resumeMusicOnFirstInteraction, true);
    resumeMusicListenersAttached = false;
}

function resumeMusicOnFirstInteraction() {
    audio.play()
        .then(() => {
            if (playBtn) playBtn.textContent = "⏸";
            cleanupResumeListeners();
        })
        .catch(() => {});
}

function attachResumeListeners() {
    if (resumeMusicListenersAttached) return;
    document.addEventListener("click", resumeMusicOnFirstInteraction, true);
    document.addEventListener("keydown", resumeMusicOnFirstInteraction, true);
    document.addEventListener("touchstart", resumeMusicOnFirstInteraction, true);
    resumeMusicListenersAttached = true;
}

function tryAutoplay() {
    audio.play()
        .then(() => {
            if (playBtn) playBtn.textContent = "⏸";
            cleanupResumeListeners();
        })
        .catch(() => {
            if (playBtn) playBtn.textContent = "▶";
            attachResumeListeners();
        });
}

function playPause() {
    if (audio.paused) {
        audio.play()
            .then(() => {
                if (playBtn) playBtn.textContent = "⏸";
                cleanupResumeListeners();
            })
            .catch(() => {});
    } else {
        audio.pause();
        if (playBtn) playBtn.textContent = "▶";
    }
}

function next() {
    loadTrack(currentIndex + 1, true);
}

function stopHomepageMusic() {
    audio.pause();
    audio.currentTime = 0;
    if (playBtn) playBtn.textContent = "▶";
    cleanupResumeListeners();
}

audio.addEventListener("loadedmetadata", () => {
    if (timeDurEl) timeDurEl.textContent = fmtTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    if (isUserSeeking) return;

    const dur = audio.duration || 0;
    const cur = audio.currentTime || 0;

    if (timeCurEl) timeCurEl.textContent = fmtTime(cur);

    if (seekEl) {
        if (dur > 0) {
            seekEl.value = String(Math.round((cur / dur) * 1000));
        } else {
            seekEl.value = "0";
        }
    }
});

audio.addEventListener("ended", () => next());

if (playBtn) playBtn.addEventListener("click", playPause);
if (nextBtn) nextBtn.addEventListener("click", next);

if (volEl) {
    audio.volume = Number(volEl.value) / 100;
    volEl.addEventListener("input", () => {
        audio.volume = Number(volEl.value) / 100;
    });
}

if (seekEl) {
    seekEl.addEventListener("input", () => {
        isUserSeeking = true;
    });

    seekEl.addEventListener("change", () => {
        const dur = audio.duration || 0;
        const ratio = Number(seekEl.value) / 1000;
        audio.currentTime = dur * ratio;
        isUserSeeking = false;
    });
}

function openQueue() {
    if (!queuePanel) return;
    queuePanel.classList.add("is-open");
    queuePanel.setAttribute("aria-hidden", "false");
}

function closeQueue() {
    if (!queuePanel) return;
    queuePanel.classList.remove("is-open");
    queuePanel.setAttribute("aria-hidden", "true");
}

if (openQueueBtn) {
    openQueueBtn.addEventListener("click", () => {
        if (!queuePanel) return;
        if (queuePanel.classList.contains("is-open")) closeQueue();
        else openQueue();
    });
}

if (closeQueueBtn) closeQueueBtn.addEventListener("click", closeQueue);

document.addEventListener("click", (e) => {
    if (!queuePanel || !playerEl) return;
    if (!queuePanel.classList.contains("is-open")) return;
    if (playerEl.contains(e.target)) return;
    closeQueue();
});

renderQueue();
loadTrack(0, false);

function showPlayerAndAutoplay() {
    if (!playerEl) return;
    playerEl.classList.add("is-visible");
    playerEl.setAttribute("aria-hidden", "false");
    tryAutoplay();
}

function showPlayerOnly() {
    if (!playerEl) return;
    playerEl.classList.add("is-visible");
    playerEl.setAttribute("aria-hidden", "false");
}

if (shouldSkipIntro) {
    showPlayerOnly();
    tryAutoplay();
}

let isEntering = false;

function startEnter() {
    if (!intro || !portal || !main) return;
    if (intro.classList.contains("is-starting") || isEntering) return;

    isEntering = true;
    sessionStorage.setItem("valentioIntroSeen", "1");

    showPlayerAndAutoplay();

    intro.classList.add("is-starting");
    portal.setAttribute("aria-hidden", "false");

    window.setTimeout(() => {
        intro.classList.add("is-fading");
        unlockMain();
    }, 820);

    window.setTimeout(() => {
        removeIntro();
        cleanSkipIntroFromUrl();
    }, 1320);
}

if (enterBtn) {
    enterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startEnter();
    });
}

if (intro) {
    intro.addEventListener("click", (e) => {
        const clickedButton = e.target.closest("#enterBtn");
        if (clickedButton) return;
        startEnter();
    });

    intro.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            startEnter();
        }
    });
}

const previewVideos = document.querySelectorAll("video[data-autoplay]");

const io = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (!video) return;

            if (entry.isIntersecting) {
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    },
    { threshold: 0.35 }
);

previewVideos.forEach((video) => io.observe(video));

const topicCards = document.querySelectorAll(".topicCard");
const pageTransition = document.getElementById("pageTransition");
const transitionVideo = document.getElementById("transitionVideo");

let isTransitioning = false;

function goToTopic(card) {
    if (!card || isTransitioning) return;

    const target = card.dataset.target;
    const transitionSrc = card.dataset.transition;

    if (!target) return;

    stopHomepageMusic();

    if (!transitionSrc || !pageTransition || !transitionVideo) {
        window.location.href = target;
        return;
    }

    isTransitioning = true;
    document.body.style.overflow = "hidden";

    pageTransition.classList.add("is-active");
    pageTransition.setAttribute("aria-hidden", "false");

    transitionVideo.pause();
    transitionVideo.innerHTML = "";
    transitionVideo.muted = false;
    transitionVideo.volume = 1;
    transitionVideo.currentTime = 0;

    const source = document.createElement("source");
    source.src = transitionSrc;
    source.type = "video/mp4";
    transitionVideo.appendChild(source);
    transitionVideo.load();

    const cleanup = () => {
        document.removeEventListener("keydown", handleKey);
        pageTransition.onclick = null;
    };

    const finish = () => {
        if (!isTransitioning) return;
        cleanup();
        isTransitioning = false;
        window.location.href = target;
    };

    function skipTransition() {
        finish();
    }

    function handleKey(e) {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            skipTransition();
        }
    }

    pageTransition.onclick = skipTransition;
    document.addEventListener("keydown", handleKey);

    transitionVideo.onloadedmetadata = () => {
        transitionVideo.currentTime = 0;
        transitionVideo.play().catch(() => {
            finish();
        });
    };

    transitionVideo.onended = () => {
        finish();
    };

    transitionVideo.onerror = () => {
        finish();
    };
}

topicCards.forEach((card) => {
    card.addEventListener("click", () => goToTopic(card));

    card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToTopic(card);
        }
    });
});