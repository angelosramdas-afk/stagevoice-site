/* StageVoice site: plays the demo video while it is on screen, and sets the
   footer year. No dependencies. */

(() => {
  "use strict";

  // Play the (muted) demo while it's visible, pause when scrolled away.
  // Skipped for visitors who prefer reduced motion; controls still work.
  const video = document.querySelector("#demo video");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (video && "IntersectionObserver" in window && !reduceMotion.matches) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {}); // no file yet, or autoplay blocked
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 },
    ).observe(video);
  }

  // Footer year.
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
