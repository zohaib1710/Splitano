(() => {
  const header = document.querySelector("[data-site-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const navOverlay = document.querySelector("[data-nav-overlay]");
  const closeNav = document.querySelector("[data-nav-close]");
  let getStartedModal = null;
  let lastModalTrigger = null;

  const createGetStartedModal = () => {
    if (getStartedModal) return getStartedModal;

    const modal = document.createElement("div");
    modal.setAttribute("data-get-started-modal", "");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal-backdrop" data-get-started-close></div>
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="get-started-title">
        <button class="modal-close" type="button" data-get-started-close aria-label="Close form"><i data-lucide="x"></i></button>
        <div class="modal-grid grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <div class="modal-intro rounded-3xl bg-navy p-6 text-white">
            <img src="img/splitano-logo-white.png" alt="Splitano" class="site-logo site-logo-modal">
            <p class="section-kicker mt-6 text-gold">Get Started</p>
            <h2 id="get-started-title" class="mt-4 text-3xl font-extrabold">Ready to make this bill easier to manage?</h2>
            <p class="mt-4 leading-7 text-paleblue">Share a few details and the Splitano team will help you find the right next step for your bill, repayment timing, or account question.</p>
          </div>
          <form data-contact-form data-get-started-form method="post" action="contact.html" novalidate class="modal-form rounded-3xl bg-white p-5 md:p-6">
            <img src="img/splitano-logo-black.png" alt="Splitano" class="site-logo modal-mobile-logo">
            <div data-contact-tabs class="grid gap-3 rounded-full bg-paleblue p-2 sm:grid-cols-2">
              <button data-contact-tab="support" class="tab-button rounded-full px-5 py-3 font-extrabold text-navy transition" type="button" aria-selected="true">General Support</button>
              <button data-contact-tab="business" class="tab-button rounded-full px-5 py-3 font-extrabold text-navy transition" type="button" aria-selected="false">Business Inquiries</button>
            </div>
            <div class="mt-6 grid gap-5 md:grid-cols-2">
              <label class="font-bold text-navy">Name<input name="name" required class="field-shell mt-2" type="text" autocomplete="name"></label>
              <label class="font-bold text-navy">Email<input name="email" required class="field-shell mt-2" type="email" autocomplete="email"></label>
            </div>
            <div class="grid gap-1 md:grid-cols-2"><p data-error-for="name" class="text-sm font-bold text-red-600"></p><p data-error-for="email" class="text-sm font-bold text-red-600"></p></div>
            <label class="mt-5 block font-bold text-navy">Subject<select data-contact-subject name="subject" required class="field-shell mt-2"><option value="">Choose a topic</option><option>Customer support</option><option>Business partnership</option><option>Credit Builder</option></select></label>
            <p data-error-for="subject" class="text-sm font-bold text-red-600"></p>
            <div data-contact-panel="support"><label class="mt-5 block font-bold text-navy">Bill or account question<textarea name="message" data-required-when-visible="true" required rows="5" class="field-shell mt-2"></textarea></label></div>
            <div data-contact-panel="business" hidden>
              <div class="mt-5 grid gap-5 md:grid-cols-2">
                <label class="font-bold text-navy">Company<input name="company" data-required-when-visible="true" class="field-shell mt-2" type="text"></label>
                <label class="font-bold text-navy">Monthly bill volume<input name="volume" class="field-shell mt-2" type="number" min="0"></label>
              </div>
              <label class="mt-5 block font-bold text-navy">Partnership notes<textarea name="business_message" data-required-when-visible="true" rows="5" class="field-shell mt-2"></textarea></label>
            </div>
            <p data-error-for="message" class="text-sm font-bold text-red-600"></p>
            <p data-error-for="company" class="text-sm font-bold text-red-600"></p>
            <p data-error-for="business_message" class="text-sm font-bold text-red-600"></p>
            <button class="btn-primary mt-6 w-full" type="submit">Send message</button>
            <p data-form-status class="mt-4 font-bold text-navy" role="status"></p>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    getStartedModal = modal;
    initContactTabs(modal);
    initContactForms(modal);
    if (window.lucide) window.lucide.createIcons();
    return modal;
  };

  const setGetStartedOpen = (isOpen, trigger = null) => {
    const modal = createGetStartedModal();
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);
    if (isOpen) {
      lastModalTrigger = trigger;
      setNavOpen(false);
      window.setTimeout(() => modal.querySelector("input, select, textarea")?.focus(), 80);
    } else {
      lastModalTrigger?.focus?.();
    }
  };

  const collapseMobileFeatures = () => {
    document.querySelectorAll("[data-mobile-features-toggle]").forEach((button) => {
      const panelId = button.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      button.setAttribute("aria-expanded", "false");
      if (panel) panel.hidden = true;
    });
  };

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
    } else {
      collapseMobileFeatures();
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

  document.querySelectorAll("[data-features-dropdown]").forEach((dropdown) => {
    const toggle = dropdown.querySelector("[data-features-toggle]");
    const menu = dropdown.querySelector("[data-features-menu]");
    const setOpen = (isOpen) => {
      dropdown.classList.toggle("features-open", isOpen);
      toggle?.setAttribute("aria-expanded", String(isOpen));
      menu?.setAttribute("aria-hidden", String(!isOpen));
    };

    toggle?.addEventListener("click", (event) => {
      event.preventDefault();
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    dropdown.addEventListener("mouseleave", () => setOpen(false));
    dropdown.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle?.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) setOpen(false);
    });
  });

  document.querySelectorAll("[data-mobile-features-toggle]").forEach((button) => {
    const panelId = button.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    button.addEventListener("click", () => {
      const isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (getStartedModal?.getAttribute("aria-hidden") === "false") setGetStartedOpen(false);
      setNavOpen(false);
      collapseMobileFeatures();
    }
  });

  document.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-get-started-close]");
    if (closeButton) {
      setGetStartedOpen(false);
      return;
    }

    const link = event.target.closest('a[href="contact.html"]');
    if (!link) return;
    const label = link.textContent.trim().toLowerCase();
    if (!/get started|start with a bill/.test(label)) return;
    event.preventDefault();
    setGetStartedOpen(true, link);
  });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });
  if (["pay-in-4.html", "bill-pay.html"].includes(currentPage)) {
    document.querySelectorAll("[data-features-toggle], [data-mobile-features-toggle]").forEach((button) => {
      button.classList.add("text-skyblue");
    });
  }

  document.querySelectorAll("[data-biller-marquee]").forEach((track) => {
    const carousel = track.closest(".biller-carousel");
    if (!carousel || track.dataset.marqueeReady === "true") return;
    track.dataset.marqueeReady = "true";

    Array.from(track.children).forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    let resumeTimer;
    const pause = () => {
      window.clearTimeout(resumeTimer);
      carousel.classList.add("is-paused");
    };
    const resumeSoon = () => {
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => carousel.classList.remove("is-paused"), 900);
    };

    carousel.addEventListener("pointerenter", pause);
    carousel.addEventListener("pointerleave", resumeSoon);
    carousel.addEventListener("pointerdown", pause);
    carousel.addEventListener("pointerup", resumeSoon);
    carousel.addEventListener("pointercancel", resumeSoon);
    carousel.addEventListener("touchstart", pause, { passive: true });
    carousel.addEventListener("touchend", resumeSoon, { passive: true });
    carousel.addEventListener("focusin", pause);
    carousel.addEventListener("focusout", resumeSoon);
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

  const initContactForms = (root = document) => {
    root.querySelectorAll("[data-contact-form]").forEach((contactForm) => {
      if (contactForm.dataset.validationReady === "true") return;
      contactForm.dataset.validationReady = "true";

    const showError = (field, message) => {
      const error = contactForm.querySelector(`[data-error-for="${field.name}"]`);
      field.setAttribute("aria-invalid", "true");
      if (error) error.textContent = message;
    };

    const clearError = (field) => {
      const error = contactForm.querySelector(`[data-error-for="${field.name}"]`);
      field.removeAttribute("aria-invalid");
      field.classList.toggle("is-valid", Boolean(field.value.trim()));
      if (error) error.textContent = "";
    };

    contactForm.querySelectorAll("input, textarea, select").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") clearError(field);
        field.classList.toggle("is-valid", Boolean(field.value.trim()));
      });
      field.addEventListener("blur", () => {
        field.classList.toggle("is-valid", Boolean(field.value.trim()) && field.getAttribute("aria-invalid") !== "true");
      });
    });

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

      if (status) status.textContent = "Thanks. We have your details and will help you with the next step.";
      contactForm.reset();
      fields.forEach((field) => field.classList.remove("is-valid"));
    });
    });
  };

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const shortCurrency = (value) => currency.format(Number.isFinite(value) ? value : 0).replace(".00", "");
  const splitPlan = [
    { label: "Payment 1", percentage: 0.4 },
    { label: "Payment 2", percentage: 0.2 },
    { label: "Payment 3", percentage: 0.2 },
    { label: "Payment 4", percentage: 0.2 }
  ];
  const pulse = (element) => {
    if (!element) return;
    element.classList.remove("number-pulse");
    void element.offsetWidth;
    element.classList.add("number-pulse");
  };

  const homeSplitPreview = document.querySelector("[data-home-split-preview]");
  if (homeSplitPreview) {
    const amountInput = homeSplitPreview.querySelector("[data-home-split-amount]");
    const payment = homeSplitPreview.querySelector("[data-home-split-payment]");
    const rows = Array.from(homeSplitPreview.querySelectorAll("[data-home-split-row]"));
    const meter = homeSplitPreview.querySelector("[data-home-split-meter]");
    const updateHomeSplit = () => {
      const amount = Math.max(0, Number(amountInput?.value || 0));
      const payments = splitPlan.map((item) => amount * item.percentage);
      if (payment) payment.textContent = shortCurrency(payments[0]);
      rows.forEach((row, index) => {
        const planItem = splitPlan[index] || splitPlan[splitPlan.length - 1];
        row.textContent = `${shortCurrency(payments[index])} ${planItem.label.toLowerCase()} (${Math.round(planItem.percentage * 100)}%)`;
      });
      if (meter) meter.style.setProperty("--split-progress", `${Math.min(100, Math.max(12, amount / 8))}%`);
      pulse(payment);
    };
    amountInput?.addEventListener("input", updateHomeSplit);
    updateHomeSplit();
  }

  const splitCalculator = document.querySelector("[data-split-calculator]");
  if (splitCalculator) {
    const amountInput = splitCalculator.querySelector("[data-split-amount]");
    const totalOutput = splitCalculator.querySelector("[data-split-total]");
    const rows = Array.from(splitCalculator.querySelectorAll("[data-installment-row]"));
    const updateSplit = () => {
      const amount = Math.max(0, Number(amountInput?.value || 0));
      const now = new Date();
      if (totalOutput) totalOutput.textContent = shortCurrency(amount);
      rows.forEach((row, index) => {
        const date = new Date(now);
        const planItem = splitPlan[index] || splitPlan[splitPlan.length - 1];
        date.setDate(now.getDate() + index * 14);
        row.querySelector("[data-installment-amount]").textContent = shortCurrency(amount * planItem.percentage);
        row.querySelector("[data-installment-date]").textContent = `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ${Math.round(planItem.percentage * 100)}%`;
      });
      pulse(totalOutput);
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
      pulse(movement);
    };
    range?.addEventListener("input", updateCredit);
    updateCredit();
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
      if (recovered) {
        recovered.textContent = shortCurrency(recoveredValue);
        pulse(recovered);
      }
      if (protectedValue) {
        protectedValue.textContent = shortCurrency(atRisk);
        pulse(protectedValue);
      }
      if (fewerCalls) {
        fewerCalls.textContent = `${Math.round(monthly * 0.11)}`;
        pulse(fewerCalls);
      }
    };
    volume?.addEventListener("input", updateRoi);
    average?.addEventListener("input", updateRoi);
    updateRoi();
  }

  const billPaySwitcher = document.querySelector("[data-bill-pay-switcher]");
  if (billPaySwitcher) {
    const buttons = Array.from(billPaySwitcher.querySelectorAll("[data-bill-pay-mode]"));
    const label = billPaySwitcher.querySelector("[data-bill-pay-label]");
    const heading = billPaySwitcher.querySelector("[data-bill-pay-heading]");
    const copy = billPaySwitcher.querySelector("[data-bill-pay-copy]");
    const schedule = billPaySwitcher.querySelector("[data-bill-pay-schedule]");
    const modes = {
      four: {
        label: "Four-part plan",
        heading: "Split an eligible bill into one larger first payment and three smaller follow-ups.",
        copy: "Useful when spreading the bill creates breathing room and the customer wants repayment dates shown upfront.",
        schedule: ["$153.60", "$76.80", "$76.80", "$76.80"]
      },
      once: {
        label: "Single repayment",
        heading: "Use one planned repayment when timing is the main pressure.",
        copy: "Helpful when the customer can repay in one amount, but needs the provider payment handled first.",
        schedule: ["Provider paid", "One repayment", "Clear due date"]
      }
    };
    const setMode = (mode) => {
      const selected = modes[mode] || modes.four;
      buttons.forEach((button) => {
        const active = button.dataset.billPayMode === mode;
        button.classList.toggle("bg-gold", active);
        button.classList.toggle("text-navy", active);
        button.classList.toggle("bg-white/10", !active);
        button.classList.toggle("text-white", !active);
      });
      if (label) label.textContent = selected.label;
      if (heading) heading.textContent = selected.heading;
      if (copy) copy.textContent = selected.copy;
      if (schedule) {
        schedule.innerHTML = selected.schedule.map((item) => `<span class="rounded-full bg-paleblue px-3 py-2 text-center font-extrabold">${item}</span>`).join("");
        pulse(schedule);
      }
      pulse(heading);
    };
    buttons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.billPayMode)));
    setMode("four");
  }

  const initContactTabs = (root = document) => {
    root.querySelectorAll("[data-contact-tabs]").forEach((contactTabs) => {
      if (contactTabs.dataset.tabsReady === "true") return;
      contactTabs.dataset.tabsReady = "true";
      const form = contactTabs.closest("form") || root;
      const buttons = Array.from(contactTabs.querySelectorAll("[data-contact-tab]"));
      const panels = Array.from(form.querySelectorAll("[data-contact-panel]"));
      const subject = form.querySelector("[data-contact-subject]");
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
    });
  };
  initContactForms();
  initContactTabs();

  const aboutTimeline = document.querySelector("[data-about-timeline]");
  if (aboutTimeline) {
    const track = aboutTimeline.querySelector("[data-timeline-track]");
    const slides = Array.from(aboutTimeline.querySelectorAll(".timeline-slide"));
    const dots = Array.from(aboutTimeline.querySelectorAll("[data-timeline-dot]"));
    const prev = aboutTimeline.querySelector("[data-timeline-prev]");
    const next = aboutTimeline.querySelector("[data-timeline-next]");
    let index = 0;
    const setTimeline = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      track?.style.setProperty("--timeline-index", String(index));
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("aria-current", String(dotIndex === index));
        dot.classList.toggle("bg-gold", dotIndex === index);
        dot.classList.toggle("bg-navy/20", dotIndex !== index);
      });
    };
    prev?.addEventListener("click", () => setTimeline(index - 1));
    next?.addEventListener("click", () => setTimeline(index + 1));
    dots.forEach((dot, dotIndex) => dot.addEventListener("click", () => setTimeline(dotIndex)));
    setTimeline(0);
  }

  document.querySelectorAll("[data-review-carousel]").forEach((carousel) => {
    const track = carousel.querySelector("[data-review-track]");
    const slides = Array.from(carousel.querySelectorAll(".review-slide"));
    const dots = Array.from(carousel.querySelectorAll("[data-review-dot]"));
    const prev = carousel.querySelector("[data-review-prev]");
    const next = carousel.querySelector("[data-review-next]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let autoplayId;

    const setReview = (nextIndex) => {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      track?.style.setProperty("--review-index", String(index));
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("aria-current", String(dotIndex === index));
      });
    };

    const stopAutoplay = () => {
      if (!autoplayId) return;
      window.clearInterval(autoplayId);
      autoplayId = undefined;
    };

    const startAutoplay = () => {
      if (prefersReducedMotion || slides.length < 2 || autoplayId) return;
      autoplayId = window.setInterval(() => setReview(index + 1), 4500);
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    prev?.addEventListener("click", () => {
      setReview(index - 1);
      restartAutoplay();
    });
    next?.addEventListener("click", () => {
      setReview(index + 1);
      restartAutoplay();
    });
    dots.forEach((dot, dotIndex) => dot.addEventListener("click", () => {
      setReview(dotIndex);
      restartAutoplay();
    }));
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", startAutoplay);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
    setReview(0);
    startAutoplay();
  });

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
    const children = Array.from(item.querySelectorAll(".feature-card, .lift-card, .biller-card, .timeline-slide, .comparison-table > div, .final-phone, .mini-split-row"));
    children.forEach((child, childIndex) => {
      child.classList.add("motion-child");
      child.style.setProperty("--child-index", String(childIndex % 8));
    });
  });

  const valueCards = Array.from(document.querySelectorAll(".value-card"));
  valueCards.forEach((card) => {
    card.addEventListener("click", () => {
      valueCards.forEach((item) => {
        if (item !== card) item.classList.remove("is-active");
      });
      card.classList.toggle("is-active");
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      card.click();
    });
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
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" }
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
