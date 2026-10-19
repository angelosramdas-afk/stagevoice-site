/* StageVoice site: plays the demo video (with sound when the browser allows)
   while it is on screen, and sets the footer year. No dependencies. */

(() => {
  "use strict";

  // Autoplay the demo with sound when it's on screen. Browsers only allow
  // sound after the visitor has interacted with the page, so if sound is
  // blocked the video plays muted, a "Tap for sound" button appears, and
  // sound turns on at the visitor's first tap, click or key press. It pauses
  // off screen and resumes when back, unless the visitor paused it, and it
  // stays muted if the visitor muted it themselves.
  const video = document.querySelector("#demo video");
  const soundButton = document.querySelector("#demo .sound-toggle");
  if (video) {
    let expectedMuted = video.muted;
    let mutedByVisitor = false;
    let pausedByVisitor = false;
    let pausingOffscreen = false;
    let onScreen = false;

    const setMuted = (muted) => {
      expectedMuted = muted;
      video.muted = muted;
    };
    const updateButton = () => {
      if (soundButton) soundButton.hidden = !video.muted || mutedByVisitor;
    };

    async function play() {
      if (!mutedByVisitor) {
        setMuted(false);
        try {
          await video.play();
          updateButton();
          return;
        } catch (error) {
          // Sound blocked: fall back to muted. Anything else (Low Power
          // Mode, no video file): leave it paused.
          if (error.name !== "NotAllowedError") return;
        }
      }
      setMuted(true);
      await video.play().catch(() => {});
      updateButton();
    }

    function turnSoundOn() {
      mutedByVisitor = false;
      setMuted(false);
      if (video.paused && onScreen) play();
      updateButton();
    }

    video.addEventListener("volumechange", () => {
      // A change we didn't make is the visitor using the video's controls.
      if (video.muted !== expectedMuted) {
        mutedByVisitor = video.muted;
        expectedMuted = video.muted;
      }
      updateButton();
    });
    video.addEventListener("pause", () => {
      if (!pausingOffscreen) pausedByVisitor = true;
      pausingOffscreen = false;
    });
    video.addEventListener("play", () => {
      pausedByVisitor = false;
    });

    soundButton?.addEventListener("click", turnSoundOn);

    // The first interaction anywhere lets the browser play sound.
    const firstInteraction = (event) => {
      document.removeEventListener("pointerdown", firstInteraction, true);
      document.removeEventListener("keydown", firstInteraction, true);
      if (event.target === video || event.target === soundButton) return;
      if (video.muted && !mutedByVisitor) turnSoundOn();
    };
    document.addEventListener("pointerdown", firstInteraction, true);
    document.addEventListener("keydown", firstInteraction, true);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          if (onScreen) {
            if (!pausedByVisitor) play();
          } else if (!video.paused) {
            pausingOffscreen = true;
            video.pause();
          }
        },
        { threshold: 0.25 },
      ).observe(video);
    } else {
      onScreen = true;
      play();
    }
  }

  // Footer year.
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
