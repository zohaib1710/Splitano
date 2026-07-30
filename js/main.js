(() => {
  const header = document.querySelector("[data-site-header]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const navOverlay = document.querySelector("[data-nav-overlay]");
  const closeNav = document.querySelector("[data-nav-close]");
  let getStartedModal = null;
  let lastModalTrigger = null;

  const cleanNavigationAndCtas = () => {
    document.querySelectorAll('a[href="business.html"], a[href="credit-builder.html"]').forEach((link) => {
      const label = link.textContent.trim().toLowerCase();
      const isNavigationItem = link.matches("[data-nav-link]") || link.closest("footer") || label === "business" || label === "credit builder";
      if (isNavigationItem) {
        link.remove();
      } else {
        link.href = link.getAttribute("href") === "business.html" ? "bill-pay.html" : "pay-in-4.html";
      }
    });

    const ctaLabels = new Map([
      ["Get Started", "Start Your Application"],
      ["Start with a bill", "Apply with Your Bill"],
      ["Explore Bill pay", "Explore Payment Options"],
      ["Explore Pay in 4", "See Pay in 4 Options"],
      ["See supported billers", "View Eligible Billers"],
      ["Learn More", "See How It Works"]
    ]);
    document.querySelectorAll("a, button, span").forEach((element) => {
      const label = element.textContent.trim();
      if (ctaLabels.has(label)) element.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === label) node.textContent = ctaLabels.get(label);
      });
    });

    const billPayHeroBillerLink = document.querySelector('.brand-shell a[href="billers.html"]');
    if (billPayHeroBillerLink) {
      billPayHeroBillerLink.href = "tel:+17548128575";
      billPayHeroBillerLink.textContent = "Call Now";
    }
  };

  cleanNavigationAndCtas();

  const createGetStartedModal = () => {
    if (getStartedModal) return getStartedModal;

    const modal = document.createElement("div");
    modal.setAttribute("data-get-started-modal", "");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal-backdrop" data-get-started-close></div>
      <div class="modal-panel application-modal-panel" role="dialog" aria-modal="true" aria-labelledby="get-started-title">
        <button class="modal-close" type="button" data-get-started-close aria-label="Close form"><i data-lucide="x"></i></button>
        <div class="modal-grid application-modal-grid grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
          <aside class="modal-intro application-intro rounded-3xl bg-navy p-6 text-white">
            <img src="img/splitano-logo-white.png" alt="Splitano" class="site-logo site-logo-modal">
            <div class="application-intro-copy">
              <p class="section-kicker mt-6 text-gold">Start your application</p>
              <h2 id="get-started-title" class="mt-4 text-3xl font-extrabold">Let's make this bill easier to manage.</h2>
              <p class="mt-4 leading-7 text-paleblue">Share a few details about your bill and choose the payment option that works best for you. Our team will review your application and guide you through the next steps.</p>
            </div>
            <div class="application-benefits mt-8 grid gap-5">
              <div class="application-benefit"><span class="application-benefit-icon"><i data-lucide="shield-check"></i></span><span><strong>Secure &amp; Private</strong><small>Your information is encrypted and always protected.</small></span></div>
              <div class="application-benefit"><span class="application-benefit-icon"><i data-lucide="clock-3"></i></span><span><strong>Quick Review</strong><small>Most applications are reviewed within 1 business day.</small></span></div>
              <div class="application-benefit"><span class="application-benefit-icon"><i data-lucide="circle-check"></i></span><span><strong>Flexible Options</strong><small>Choose Pay in 4 or Pay in Full—whichever works for you.</small></span></div>
            </div>
          </aside>
          <form data-application-form method="post" action="contact.html" novalidate class="modal-form application-form rounded-3xl bg-white p-5 md:p-6">
            <img src="img/splitano-logo-black.png" alt="Splitano" class="site-logo modal-mobile-logo">
            <div class="application-fields grid gap-4 md:grid-cols-2">
              <label class="application-label">Full name<div class="application-input-wrap"><i data-lucide="user-round"></i><input name="full_name" required class="field-shell" type="text" autocomplete="name" placeholder="Enter your full name"></div><p data-application-error="full_name" class="application-error"></p></label>
              <label class="application-label">Phone number<div class="application-input-wrap"><i data-lucide="phone"></i><input name="phone" required class="field-shell" type="tel" autocomplete="tel" placeholder="(123) 456-7890"></div><p data-application-error="phone" class="application-error"></p></label>
              <label class="application-label md:col-span-2">Email address <span>(optional)</span><div class="application-input-wrap"><i data-lucide="mail"></i><input name="email" class="field-shell" type="email" autocomplete="email" placeholder="Enter your email address"></div><p data-application-error="email" class="application-error"></p></label>
              <label class="application-label md:col-span-2">Bill provider<div class="application-input-wrap"><i data-lucide="landmark"></i><input name="provider" required class="field-shell" type="text" placeholder="Enter the name of your provider"></div><p data-application-error="provider" class="application-error"></p></label>
              <div class="application-label md:col-span-2"><span>Payment option</span><div class="application-select" data-payment-select><button data-payment-trigger class="application-select-trigger" type="button" aria-expanded="false" aria-controls="payment-options"><span><i data-lucide="credit-card"></i><span data-payment-label>Select your payment option</span></span><i data-lucide="chevron-down"></i></button><div id="payment-options" data-payment-menu class="application-select-menu" hidden><button data-payment-choice="pay-in-4" type="button"><span class="application-option-icon"><i data-lucide="calendar-days"></i></span><span><strong>Pay in 4</strong><small>Split your bill into 4 payments with the first payment due today and the remaining payments scheduled each week.</small></span></button><button data-payment-choice="pay-in-full" type="button"><span class="application-option-icon application-option-icon-green"><i data-lucide="banknote"></i></span><span><strong>Pay in Full</strong><small>Pay your bill in full today and save 25% on our service fee.</small></span></button></div></div><input data-payment-input name="payment_option" required type="hidden"><p data-application-error="payment_option" class="application-error"></p></div>
              <div class="application-label md:col-span-2"><span>Upload your bill</span><label class="application-upload" data-upload-dropzone><input data-file-input name="bill_file" required type="file" accept=".pdf,.jpg,.jpeg,.png"><span class="application-upload-icon"><i data-lucide="cloud-upload"></i></span><span><strong data-file-name>Click to upload or drag and drop</strong><small>PDF, JPG, PNG up to 10MB</small></span></label><p data-application-error="bill_file" class="application-error"></p></div>
              <label class="application-label md:col-span-2">Additional notes <span>(optional)</span><div class="application-input-wrap application-textarea-wrap"><i data-lucide="message-square-text"></i><textarea data-notes-input name="notes" class="field-shell" rows="3" maxlength="500" placeholder="Anything you'd like our team to know?"></textarea><span class="application-counter"><span data-notes-count>0</span>/500</span></div><p data-application-error="notes" class="application-error"></p></label>
            </div>
            <button class="btn-primary application-submit mt-5 w-full" type="submit"><i data-lucide="lock-keyhole"></i>Submit application</button>
            <p data-application-status class="mt-3 text-center font-bold text-navy" role="status"></p>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    getStartedModal = modal;
    initApplicationForm(modal);
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
    if (!/get started|start your application|start with a bill/.test(label)) return;
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

  const initApplicationForm = (root) => {
    const form = root.querySelector("[data-application-form]");
    if (!form || form.dataset.applicationReady === "true") return;
    form.dataset.applicationReady = "true";

    const paymentSelect = form.querySelector("[data-payment-select]");
    const paymentTrigger = form.querySelector("[data-payment-trigger]");
    const paymentMenu = form.querySelector("[data-payment-menu]");
    const paymentInput = form.querySelector("[data-payment-input]");
    const paymentLabel = form.querySelector("[data-payment-label]");
    const fileInput = form.querySelector("[data-file-input]");
    const dropzone = form.querySelector("[data-upload-dropzone]");
    const fileName = form.querySelector("[data-file-name]");
    const notesInput = form.querySelector("[data-notes-input]");
    const notesCount = form.querySelector("[data-notes-count]");
    const status = form.querySelector("[data-application-status]");
    const maxFileSize = 10 * 1024 * 1024;
    const validFileTypes = ["application/pdf", "image/jpeg", "image/png"];

    const errorFor = (name) => form.querySelector(`[data-application-error="${name}"]`);
    const showError = (field, message) => {
      field?.setAttribute("aria-invalid", "true");
      const error = errorFor(field?.name);
      if (error) error.textContent = message;
    };
    const clearError = (field) => {
      field?.removeAttribute("aria-invalid");
      if (field && field !== paymentInput) field.classList.toggle("is-valid", Boolean(field.value.trim()));
      const error = errorFor(field?.name);
      if (error) error.textContent = "";
    };
    const closePaymentMenu = () => {
      if (!paymentMenu || !paymentTrigger) return;
      paymentMenu.hidden = true;
      paymentTrigger.setAttribute("aria-expanded", "false");
      paymentSelect?.classList.remove("is-open");
    };
    const updateFileName = (file) => {
      if (!fileName) return;
      fileName.textContent = file ? file.name : "Click to upload or drag and drop";
      dropzone?.classList.toggle("has-file", Boolean(file));
    };
    const validateFile = (file) => {
      if (!file) return "Upload your bill to continue.";
      if (!validFileTypes.includes(file.type)) return "Upload a PDF, JPG, or PNG file.";
      if (file.size > maxFileSize) return "Your file must be 10MB or smaller.";
      return "";
    };
    const setFile = (file) => {
      if (!fileInput || !file) return;
      const message = validateFile(file);
      if (message) {
        showError(fileInput, message);
        updateFileName(null);
        fileInput.value = "";
        return;
      }
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInput.files = transfer.files;
      clearError(fileInput);
      updateFileName(file);
    };

    paymentTrigger?.addEventListener("click", () => {
      const isOpen = !paymentMenu.hidden;
      paymentMenu.hidden = isOpen;
      paymentTrigger.setAttribute("aria-expanded", String(!isOpen));
      paymentSelect?.classList.toggle("is-open", !isOpen);
    });
    paymentMenu?.querySelectorAll("[data-payment-choice]").forEach((choice) => {
      choice.addEventListener("click", () => {
        paymentInput.value = choice.dataset.paymentChoice || "";
        paymentLabel.textContent = choice.querySelector("strong")?.textContent || "Select your payment option";
        clearError(paymentInput);
        closePaymentMenu();
      });
    });
    document.addEventListener("click", (event) => {
      if (paymentSelect && !paymentSelect.contains(event.target)) closePaymentMenu();
    });

    form.querySelectorAll("input:not([type=hidden]), textarea").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.getAttribute("aria-invalid") === "true") clearError(field);
        field.classList.toggle("is-valid", Boolean(field.value.trim()));
      });
      field.addEventListener("blur", () => {
        field.classList.toggle("is-valid", Boolean(field.value.trim()) && field.getAttribute("aria-invalid") !== "true");
      });
    });
    notesInput?.addEventListener("input", () => {
      if (notesCount) notesCount.textContent = String(notesInput.value.length);
    });
    fileInput?.addEventListener("change", () => setFile(fileInput.files?.[0]));
    ["dragenter", "dragover"].forEach((eventName) => dropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragging");
    }));
    ["dragleave", "drop"].forEach((eventName) => dropzone?.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragging");
    }));
    dropzone?.addEventListener("drop", (event) => setFile(event.dataTransfer?.files?.[0]));

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let isValid = true;
      const fields = Array.from(form.querySelectorAll("input:not([type=hidden]), textarea"));
      fields.forEach((field) => clearError(field));
      clearError(paymentInput);

      const fullName = form.elements.full_name;
      const phone = form.elements.phone;
      const email = form.elements.email;
      const provider = form.elements.provider;
      if (!fullName.value.trim()) { showError(fullName, "Enter your full name."); isValid = false; }
      if (!phone.value.trim()) { showError(phone, "Enter your phone number."); isValid = false; }
      else if (!/^[+()\d\s.-]{7,}$/.test(phone.value.trim())) { showError(phone, "Enter a valid phone number."); isValid = false; }
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showError(email, "Enter a valid email address."); isValid = false; }
      if (!provider.value.trim()) { showError(provider, "Enter your bill provider."); isValid = false; }
      if (!paymentInput.value) { showError(paymentInput, "Choose a payment option."); isValid = false; }
      const fileMessage = validateFile(fileInput.files?.[0]);
      if (fileMessage) { showError(fileInput, fileMessage); isValid = false; }
      if (!isValid) {
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        firstInvalid?.focus?.();
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }
      if (status) status.textContent = "Thanks. We received your application and will be in touch soon.";
      form.reset();
      fields.forEach((field) => field.classList.remove("is-valid"));
      paymentInput.value = "";
      paymentLabel.textContent = "Select your payment option";
      updateFileName(null);
      if (notesCount) notesCount.textContent = "0";
    });
  };

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
    { label: "today", percentage: 0.4 },
    { label: "2nd week", percentage: 0.2 },
    { label: "3rd week", percentage: 0.2 },
    { label: "4th week", percentage: 0.2 }
  ];
  const maxCalculatorAmount = 1000000;
  const normalizeCalculatorAmount = (input) => {
    const amount = Math.min(maxCalculatorAmount, Math.max(0, Number(input?.value || 0) || 0));
    if (input && Number(input.value || 0) !== amount) input.value = String(amount);
    if (input) input.max = String(maxCalculatorAmount);
    return amount;
  };
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
    const rows = Array.from(homeSplitPreview.querySelectorAll(".mini-split-row"));
    const meter = homeSplitPreview.querySelector("[data-home-split-meter]");
    const updateHomeSplit = () => {
      const amount = normalizeCalculatorAmount(amountInput);
      const payments = splitPlan.map((item) => amount * item.percentage);
      if (payment) payment.textContent = shortCurrency(payments[0]);
      rows.forEach((row, index) => {
        const planItem = splitPlan[index] || splitPlan[splitPlan.length - 1];
        const rowLabel = row.querySelector("[data-home-split-row]");
        const combinedLabel = row.querySelector(":scope > p:first-child");
        if (combinedLabel) combinedLabel.textContent = `${shortCurrency(payments[index])} ${planItem.label}`;
        if (rowLabel) rowLabel.hidden = true;
      });
      if (meter) meter.style.setProperty("--split-progress", `${Math.min(100, Math.max(12, amount / 8))}%`);
      pulse(payment);
    };
    amountInput?.addEventListener("input", updateHomeSplit);
    updateHomeSplit();
  }

  const fullPayCalculator = document.querySelector("[data-full-pay-calculator]");
  if (fullPayCalculator) {
    const amountInput = fullPayCalculator.querySelector("[data-full-pay-amount]");
    const savingsOutput = fullPayCalculator.querySelector("[data-full-pay-savings]");
    const totalOutput = fullPayCalculator.querySelector("[data-full-pay-total]");
    const updateFullPay = () => {
      const amount = normalizeCalculatorAmount(amountInput);
      if (savingsOutput) savingsOutput.textContent = shortCurrency(amount * 0.25);
      if (totalOutput) totalOutput.textContent = shortCurrency(amount * 0.75);
      pulse(savingsOutput);
      pulse(totalOutput);
    };
    amountInput?.addEventListener("input", updateFullPay);
    updateFullPay();
  }

  const fixedInstallmentLabels = ["today", "2nd week", "3rd week", "4th week"];
  document.querySelectorAll(".final-phone.front .final-phone-header p").forEach((text) => {
    if (text.textContent.trim() === "Then every two weeks") text.textContent = "Then every week";
  });
  document.querySelectorAll(".final-phone.front .final-phone-pill").forEach((row, index) => {
    const label = row.querySelector("span");
    if (label) label.textContent = fixedInstallmentLabels[index] || fixedInstallmentLabels[fixedInstallmentLabels.length - 1];
  });

  const heroInstallmentRows = document.querySelectorAll(".brand-shell .interactive-panel .grid.gap-3 > div > p");
  if (heroInstallmentRows.length === 4) {
    ["$153.60 today", "$76.80 2nd week", "$76.80 3rd week", "$76.80 4th week"].forEach((text, index) => {
      heroInstallmentRows[index].textContent = text;
    });
  }

  const splitCalculator = document.querySelector("[data-split-calculator]");
  if (splitCalculator) {
    const amountInput = splitCalculator.querySelector("[data-split-amount]");
    const totalOutput = splitCalculator.querySelector("[data-split-total]");
    const rows = Array.from(splitCalculator.querySelectorAll("[data-installment-row]"));
    const updateSplit = () => {
      const amount = normalizeCalculatorAmount(amountInput);
      if (totalOutput) totalOutput.textContent = shortCurrency(amount);
      rows.forEach((row, index) => {
        const planItem = splitPlan[index] || splitPlan[splitPlan.length - 1];
        row.querySelector("[data-installment-amount]").textContent = shortCurrency(amount * planItem.percentage);
        row.querySelector("[data-installment-date]").textContent = planItem.label;
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

  document.querySelectorAll("section").forEach((section) => {
    const kicker = section.querySelector(".section-kicker");
    const paragraph = section.querySelector("p:not(.section-kicker)");
    if (kicker?.textContent.trim() === "BEFORE YOU APPLY" && paragraph) {
      paragraph.innerHTML = paragraph.innerHTML.replace(
        "essential information",
        'essential<br class="hidden lg:block"> information'
      );
    }
  });

  const billPaySwitcher = document.querySelector("[data-bill-pay-switcher]");
  if (billPaySwitcher) {
    const buttons = Array.from(billPaySwitcher.querySelectorAll("[data-bill-pay-mode]"));
    const label = billPaySwitcher.querySelector("[data-bill-pay-label]");
    const heading = billPaySwitcher.querySelector("[data-bill-pay-heading]");
    const copy = billPaySwitcher.querySelector("[data-bill-pay-copy]");
    const schedule = billPaySwitcher.querySelector("[data-bill-pay-schedule]");
    const modes = {
      four: {
        label: "Four Part Plan",
        heading: "Spread one bill across four scheduled payments.",
        copy: "Pay the first payment today, followed by three scheduled payments each week. Every payment is shown before you confirm, making it easier to plan your budget with confidence.",
        schedule: ["$153.60 today", "$76.80 2nd week", "$76.80 3rd week", "$76.80 4th week"]
      },
      once: {
        label: "PAY IN FULL",
        heading: "Pay once and save 25%",
        copy: "Complete your eligible bill in a single payment and automatically receive 25% off. It's the fastest way to finish your payment while enjoying extra savings.",
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
