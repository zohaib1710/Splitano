(() => {
  const header = document.querySelector("[data-site-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const navOverlay = document.querySelector("[data-nav-overlay]");
  const closeNav = document.querySelector("[data-nav-close]");

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("header-scrolled", window.scrollY > 8);
  };

  const setNavOpen = (isOpen) => {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
    navOverlay?.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("nav-open", isOpen);
    if (isOpen) {
      closeNav?.focus();
    }
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

  navOverlay?.addEventListener("click", () => setNavOpen(false));

  document.querySelectorAll("[data-mobile-nav] a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.setAttribute("aria-current", "page");
    }
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

  const animatedItems = Array.from(document.querySelectorAll("[data-animate]"));
  animatedItems.forEach((item, index) => {
    item.style.setProperty("--stagger-index", String(index % 6));
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );

    animatedItems.forEach((item) => observer.observe(item));
  } else {
    animatedItems.forEach((item) => item.classList.add("is-visible"));
  }
})();
