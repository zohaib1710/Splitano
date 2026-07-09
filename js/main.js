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

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const shortCurrency = (value) => currency.format(Number.isFinite(value) ? value : 0).replace(".00", "");

  const splitCalculator = document.querySelector("[data-split-calculator]");
  if (splitCalculator) {
    const amountInput = splitCalculator.querySelector("[data-split-amount]");
    const totalOutput = splitCalculator.querySelector("[data-split-total]");
    const rows = Array.from(splitCalculator.querySelectorAll("[data-installment-row]"));
    const updateSplit = () => {
      const amount = Math.max(0, Number(amountInput?.value || 0));
      const installment = amount / 4;
      const now = new Date();
      if (totalOutput) totalOutput.textContent = shortCurrency(amount);
      rows.forEach((row, index) => {
        const date = new Date(now);
        date.setDate(now.getDate() + index * 14);
        row.querySelector("[data-installment-amount]").textContent = shortCurrency(installment);
        row.querySelector("[data-installment-date]").textContent = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      });
    };
    amountInput?.addEventListener("input", updateSplit);
    updateSplit();
  }

  const creditProjection = document.querySelector("[data-credit-projection]");
  if (creditProjection) {
    const range = creditProjection.querySelector("[data-credit-range]");
    const months = creditProjection.querySelector("[data-credit-months]");
    const movement = creditProjection.querySelector("[data-credit-movement]");
    const bar = creditProjection.querySelector("[data-credit-bar]");
    const notes = {
      3: "Early consistency: reminders, payment visibility, and fewer missed due dates.",
      6: "Stronger habit loop: more on-time repayment history and clearer monthly planning.",
      12: "Longer consistency: the clearest long-term signal of disciplined bill repayment."
    };
    const note = creditProjection.querySelector("[data-credit-note]");
    const updateCredit = () => {
      const value = Number(range?.value || 6);
      const projected = value === 3 ? 12 : value === 6 ? 28 : 54;
      if (months) months.textContent = `${value} months`;
      if (movement) movement.textContent = `+${projected}`;
      if (bar) bar.style.width = `${Math.min(100, 24 + value * 6)}%`;
      if (note) note.textContent = notes[value] || notes[6];
    };
    range?.addEventListener("input", updateCredit);
    updateCredit();
  }

  const savingsTool = document.querySelector("[data-savings-tool]");
  if (savingsTool) {
    const input = savingsTool.querySelector("[data-savings-bill]");
    const toggle = savingsTool.querySelector("[data-savings-toggle]");
    const current = savingsTool.querySelector("[data-savings-current]");
    const splitano = savingsTool.querySelector("[data-savings-splitano]");
    const saved = savingsTool.querySelector("[data-savings-saved]");
    const bar = savingsTool.querySelector("[data-savings-bar]");
    const updateSavings = () => {
      const bill = Math.max(0, Number(input?.value || 0));
      const negotiated = toggle?.checked ? 0.16 : 0.08;
      const newBill = bill * (1 - negotiated);
      if (current) current.textContent = shortCurrency(bill);
      if (splitano) splitano.textContent = shortCurrency(newBill);
      if (saved) saved.textContent = shortCurrency(bill - newBill);
      if (bar) bar.style.width = `${Math.max(8, negotiated * 100 * 4)}%`;
    };
    input?.addEventListener("input", updateSavings);
    toggle?.addEventListener("change", updateSavings);
    updateSavings();
  }

  const roiTool = document.querySelector("[data-roi-tool]");
  if (roiTool) {
    const volume = roiTool.querySelector("[data-roi-volume]");
    const average = roiTool.querySelector("[data-roi-average]");
    const recovered = roiTool.querySelector("[data-roi-recovered]");
    const protectedValue = roiTool.querySelector("[data-roi-protected]");
    const fewerCalls = roiTool.querySelector("[data-roi-calls]");
    const updateRoi = () => {
      const monthly = Math.max(0, Number(volume?.value || 0));
      const avg = Math.max(0, Number(average?.value || 0));
      const atRisk = monthly * avg * 0.18;
      const recoveredValue = atRisk * 0.36;
      if (recovered) recovered.textContent = shortCurrency(recoveredValue);
      if (protectedValue) protectedValue.textContent = shortCurrency(atRisk);
      if (fewerCalls) fewerCalls.textContent = `${Math.round(monthly * 0.11)}`;
    };
    volume?.addEventListener("input", updateRoi);
    average?.addEventListener("input", updateRoi);
    updateRoi();
  }

  const contactTabs = document.querySelector("[data-contact-tabs]");
  if (contactTabs) {
    const buttons = Array.from(contactTabs.querySelectorAll("[data-contact-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-contact-panel]"));
    const subject = document.querySelector("[data-contact-subject]");
    const setTab = (type) => {
      buttons.forEach((button) => button.setAttribute("aria-selected", String(button.dataset.contactTab === type)));
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.contactPanel !== type;
        panel.querySelectorAll("input, textarea, select").forEach((field) => {
          if (panel.hidden) {
            field.removeAttribute("required");
          } else if (field.dataset.requiredWhenVisible === "true") {
            field.setAttribute("required", "");
          }
        });
      });
      if (subject) subject.value = type === "business" ? "Business partnership" : "Customer support";
    };
    buttons.forEach((button) => button.addEventListener("click", () => setTab(button.dataset.contactTab)));
    setTab("support");
  }

  const faqSearch = document.querySelector("[data-faq-search]");
  if (faqSearch) {
    const items = Array.from(document.querySelectorAll("[data-faq-item]"));
    faqSearch.addEventListener("input", () => {
      const query = faqSearch.value.trim().toLowerCase();
      items.forEach((item) => {
        item.hidden = query && !item.textContent.toLowerCase().includes(query);
      });
    });
  }

  const billerDirectory = document.querySelector("[data-biller-directory]");
  if (billerDirectory) {
    const search = billerDirectory.querySelector("[data-biller-search]");
    const chips = Array.from(billerDirectory.querySelectorAll("[data-biller-filter]"));
    const cards = Array.from(billerDirectory.querySelectorAll("[data-biller-card]"));
    let activeCategory = "all";

    const updateBillers = () => {
      const query = (search?.value || "").trim().toLowerCase();
      cards.forEach((card) => {
        const matchesCategory = activeCategory === "all" || card.dataset.billerCategory === activeCategory;
        const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
        card.hidden = !(matchesCategory && matchesQuery);
      });
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeCategory = chip.dataset.billerFilter || "all";
        chips.forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
        updateBillers();
      });
    });

    search?.addEventListener("input", updateBillers);
    updateBillers();
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

  const counters = Array.from(document.querySelectorAll("[data-count-to]"));
  const runCounter = (counter) => {
    const target = Number(counter.dataset.countTo || 0);
    const suffix = counter.dataset.countSuffix || "";
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const value = Math.round(target * progress);
      counter.textContent = `${value.toLocaleString("en-US")}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
