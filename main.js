/* StageVoice site: plays the demo video while it is on screen, and sets the
   footer year. No dependencies. */

(() => {
  "use strict";

  // Autoplay the demo (muted, looping). It starts on page load; when it's
  // scrolled off screen it pauses, and resumes when it comes back, unless
  // the visitor paused it themselves.
  const video = document.querySelector("#demo video");
  if (video) {
    video.muted = true; // some browsers only autoplay when the property is set
    const play = () => video.play().catch(() => {}); // e.g. Low Power Mode
    play();

    let pausedByVisitor = false;
    let pausingOffscreen = false;
    video.addEventListener("pause", () => {
      if (!pausingOffscreen) pausedByVisitor = true;
      pausingOffscreen = false;
    });
    video.addEventListener("play", () => {
      pausedByVisitor = false;
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!pausedByVisitor) play();
          } else if (!video.paused) {
            pausingOffscreen = true;
            video.pause();
          }
        },
        { threshold: 0.25 },
      ).observe(video);
    }
  }

  // Footer year.
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
