/* StageVoice site: waitlist forms (Formspree, no page reload) and playing
   the demo video while it is on screen. No dependencies. */

(() => {
  "use strict";

  // Simple, permissive check: something@something.tld
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /** Shows a message under a form. type: "success" | "error" | "" */
  function showMessage(form, text, type) {
    const message = form.querySelector(".form-message");
    message.textContent = text;
    message.classList.toggle("is-success", type === "success");
    message.classList.toggle("is-error", type === "error");
  }

  async function handleSubmit(event) {
    const form = event.currentTarget;
    event.preventDefault(); // JS is available: submit in the background

    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    const email = input.value.trim();

    if (!EMAIL_PATTERN.test(email)) {
      input.setAttribute("aria-invalid", "true");
      showMessage(form, "Please enter a valid email address.", "error");
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");

    // Guard against forgetting to set the Formspree form ID (see index.html).
    if (form.action.includes("FORMSPREE_ID")) {
      showMessage(
        form,
        "The waitlist isn't connected yet (Formspree ID missing).",
        "error",
      );
      return;
    }

    button.disabled = true;
    const label = button.textContent;
    button.textContent = "Joining…";
    showMessage(form, "", "");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        showMessage(
          form,
          "You're on the list! We'll email you when StageVoice launches.",
          "success",
        );
      } else {
        // Formspree returns { errors: [{ message }] } for problems.
        const data = await response.json().catch(() => ({}));
        const detail = data.errors?.map((e) => e.message).join(" ");
        showMessage(
          form,
          detail || "Something went wrong. Please try again.",
          "error",
        );
      }
    } catch {
      showMessage(
        form,
        "Couldn't reach the server. Check your connection and try again.",
        "error",
      );
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  }

  document.querySelectorAll("form[data-waitlist]").forEach((form) => {
    form.addEventListener("submit", handleSubmit);
    // Clear the error state as soon as the visitor edits the field.
    form.querySelector('input[type="email"]').addEventListener("input", (e) => {
      e.target.removeAttribute("aria-invalid");
      showMessage(form, "", "");
    });
  });

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
