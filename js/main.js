(() => {
  const header = document.querySelector("[data-site-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const closeNav = document.querySelector("[data-nav-close]");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("header-scrolled", window.scrollY > 8);
  };

  const setNavOpen = (isOpen) => {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.classList.toggle("translate-x-full", !isOpen);
    mobileNav.classList.toggle("translate-x-0", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!isOpen);
    });
  }

  if (closeNav) {
    closeNav.addEventListener("click", () => setNavOpen(false));
  }

  document.querySelectorAll("[data-mobile-nav] a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  document.querySelectorAll("[data-accordion-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const panelId = button.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      if (!panel) return;

      button.setAttribute("aria-expanded", String(!isExpanded));
      panel.hidden = isExpanded;
      button.querySelector("[data-accordion-icon]")?.classList.toggle("rotate-45", !isExpanded);
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const showError = (field, message) => {
      const error = contactForm.querySelector(`[data-error-for="${field.name}"]`);
      field.setAttribute("aria-invalid", "true");
      if (error) error.textContent = message;
    };

    const clearError = (field) => {
      const error = contactForm.querySelector(`[data-error-for="${field.name}"]`);
      field.removeAttribute("aria-invalid");
      if (error) error.textContent = "";
    };

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let isValid = true;
      const fields = Array.from(contactForm.querySelectorAll("input, textarea, select"));

      fields.forEach((field) => {
        clearError(field);
        if (field.hasAttribute("required") && !field.value.trim()) {
          showError(field, "This field is required.");
          isValid = false;
        }
        if (field.type === "email" && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
          showError(field, "Enter a valid email address.");
          isValid = false;
        }
      });

      const status = contactForm.querySelector("[data-form-status]");
      if (!isValid) {
        fields.find((field) => field.getAttribute("aria-invalid") === "true")?.focus();
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }

      if (status) status.textContent = "Thanks. Your message is ready to send once the backend is connected.";
      contactForm.reset();
    });
  }
})();
