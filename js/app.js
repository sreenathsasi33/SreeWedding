(function () {
  const TARGET_URL = "https://sreenathsasi33.github.io/wedding-invitation/";

  const RECEPTION_START_UTC = Date.UTC(2027, 0, 25, 11, 0, 0);
  const RECEPTION_END_UTC   = Date.UTC(2027, 0, 25, 15, 0, 0);

  const CEREMONY_START_UTC  = Date.UTC(2027, 0, 24, 5, 0, 0);
  const CEREMONY_END_UTC    = Date.UTC(2027, 0, 24, 6, 0, 0);

  const GALLERY_IMAGES = [
    { src: "assets/images/couple-4.jpg", alt: "Sreenath and Ashitha in traditional Kerala attire" },
    { src: "assets/images/couple-1.jpg", alt: "Sreenath and Ashitha evening portrait" },
    { src: "assets/images/couple-2.jpg", alt: "Sreenath and Ashitha night lights portrait" },
    { src: "assets/images/couple-3.jpg", alt: "Sreenath and Ashitha together" },
    { src: "assets/images/couple-5.jpg", alt: "Ashitha smiling candidly with Sreenath" },
    { src: "assets/images/couple-6.jpg", alt: "Sreenath smiling candidly with Ashitha" }
  ];

  // Traditional Kerala floral splash palette: Jasmine, Marigold, Hibiscus, Lotus Pink, Temple Gold
  const FLOWER_COLORS = ["#FFFDF7", "#F7B731", "#EB3B5A", "#FADBD8", "#D4AF37", "#FF9F43"];

  let currentLang = "en";
  let musicEnabled = true;
  let currentLightboxIdx = 0;

  const doorOverlay = document.getElementById("door-overlay");
  const templeBellTrigger = document.getElementById("temple-bell-trigger");
  const doorTrigger = document.getElementById("door-trigger");
  const languageOverlay = document.getElementById("language-overlay");
  const floatingControls = document.getElementById("floating-controls");
  const invitationMain = document.getElementById("invitation-main");
  const bgMusic = document.getElementById("bg-music");
  const musicToggleBtn = document.getElementById("music-toggle-btn");
  const musicToggleLabel = document.getElementById("music-toggle-label");
  const langToggleBtn = document.getElementById("lang-toggle-btn");
  const langToggleLabel = document.getElementById("lang-toggle-label");
  const petalCanvas = document.getElementById("petal-canvas");
  const bloomLayer = document.getElementById("bloom-layer");

  /* =========================================================
     1. WEB AUDIO TEMPLE BELL CHIME + CELEBRATORY FLOWER SPLASH
  ========================================================= */
  function playTempleBellChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Rich harmonic partials mimicking a cast-bronze Kerala temple mani
      const partials = [
        { freq: 880, gain: 0.24, decay: 2.4 },
        { freq: 1318.5, gain: 0.14, decay: 1.9 },
        { freq: 1760, gain: 0.11, decay: 1.6 },
        { freq: 2489, gain: 0.07, decay: 1.1 }
      ];

      partials.forEach((p) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(p.freq, now);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(p.gain, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + p.decay + 0.05);
      });
    } catch {
      // Fallback silently if Web Audio is blocked
    }
  }

  function triggerFlowerSplash(count = 54, originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    if (!bloomLayer) return;

    for (let i = 0; i < count; i++) {
      const petal = document.createElement("span");
      petal.className = "splash-flower";

      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * Math.max(window.innerWidth, window.innerHeight) * 0.55;
      const sx = Math.cos(angle) * distance;
      const sy = Math.sin(angle) * distance + 90;
      const rot = Math.round((Math.random() - 0.5) * 720);
      const size = 11 + Math.random() * 11;
      const dur = 1.15 + Math.random() * 0.65;

      petal.style.left = `${originX}px`;
      petal.style.top = `${originY}px`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 0.72}px`;
      petal.style.background = FLOWER_COLORS[i % FLOWER_COLORS.length];
      petal.style.setProperty("--sx", `${sx.toFixed(1)}px`);
      petal.style.setProperty("--sy", `${sy.toFixed(1)}px`);
      petal.style.setProperty("--srot", `${rot}deg`);
      petal.style.setProperty("--dur", `${dur.toFixed(2)}s`);

      bloomLayer.appendChild(petal);
      setTimeout(() => petal.remove(), dur * 1000 + 100);
    }

    // Also add falling petals from the top canopy
    for (let j = 0; j < 20; j++) {
      setTimeout(spawnFallingPetal, j * 35);
    }
  }

  /* =========================================================
     2. TEMPLE BELL -> TEMPLE DOORS -> GANAPATHI LANGUAGE SCREEN
  ========================================================= */
  let doorOpened = false;

  function openTempleSanctum(e) {
    if (doorOpened) return;
    doorOpened = true;

    // 1. Swing and ring the hanging temple bell
    if (templeBellTrigger) {
      templeBellTrigger.classList.add("bell-ringing");
    }
    playTempleBellChime();

    // 2. Splash flowers when opening the temple doors
    const cx = e && e.clientX ? e.clientX : window.innerWidth / 2;
    const cy = e && e.clientY ? e.clientY : window.innerHeight * 0.35;
    triggerFlowerSplash(64, cx, cy);

    // 3. Start background music cleanly on user gesture
    if (bgMusic && musicEnabled) {
      bgMusic.volume = 0.75;
      bgMusic.play().catch(() => {
        musicEnabled = false;
        updateMusicUI();
      });
    }

    // 4. Open temple doors smoothly after bell strike
    setTimeout(() => {
      doorOverlay.classList.add("doors-opening");
    }, 320);

    // 5. Smooth cross-fade into Lord Ganapathi blessing & language selection
    setTimeout(() => {
      doorOverlay.classList.add("fade-out");
      languageOverlay.classList.remove("hidden");
      languageOverlay.classList.add("overlay-entering");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          languageOverlay.classList.remove("overlay-entering");
        });
      });

      setTimeout(() => {
        doorOverlay.classList.add("hidden");
      }, 850);
    }, 1550);
  }

  if (templeBellTrigger) {
    templeBellTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      openTempleSanctum(e);
    });
  }

  if (doorTrigger) {
    doorTrigger.addEventListener("click", openTempleSanctum);
    doorTrigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openTempleSanctum(e);
      }
    });
  }

  // Language Selection -> Second Flower Splash & Smooth Transition to Invitation
  document.querySelectorAll("[data-select-lang]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const selected = btn.getAttribute("data-select-lang");
      setLanguage(selected);

      // Splash flowers again upon selecting English / Malayalam
      const cx = e.clientX || window.innerWidth / 2;
      const cy = e.clientY || window.innerHeight / 2;
      triggerFlowerSplash(68, cx, cy);

      languageOverlay.classList.add("overlay-leaving");
      setTimeout(() => {
        languageOverlay.classList.add("hidden");
        languageOverlay.classList.remove("overlay-leaving");
        document.body.classList.remove("state-doors-locked");
        invitationMain.classList.remove("hidden");
        floatingControls.classList.remove("hidden");
        startPetalShower();
        updateThaliyolaUnfold();
        initScrollReveal();
      }, 520);
    });
  });

  /* =========================================================
     3. LANGUAGE SWITCHING (NO NAME REPETITION IN MALAYALAM)
  ========================================================= */
  function setLanguage(lang) {
    currentLang = lang === "ml" ? "ml" : "en";
    document.documentElement.lang = currentLang;
    document.body.classList.toggle("lang-ml", currentLang === "ml");

    const dict = window.INVITATION_TRANSLATIONS[currentLang] || window.INVITATION_TRANSLATIONS.en;
    document.title = dict.page_title;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) {
        el.setAttribute("placeholder", dict[key]);
      }
    });

    // Hide secondary full-names line in Malayalam so groom/bride names do not repeat
    const heroFullNames = document.getElementById("hero-full-names");
    if (heroFullNames) {
      heroFullNames.classList.toggle("hidden", currentLang === "ml");
    }

    langToggleLabel.textContent = dict.lang_switch_label;
    updateMusicUI();
  }

  langToggleBtn.addEventListener("click", () => {
    setLanguage(currentLang === "en" ? "ml" : "en");
  });

  /* =========================================================
     4. BACKGROUND MUSIC CONTROL & NILAVILAKKU INTERACTION
  ========================================================= */
  function updateMusicUI() {
    const dict = window.INVITATION_TRANSLATIONS[currentLang] || window.INVITATION_TRANSLATIONS.en;
    const isPlaying = bgMusic && !bgMusic.paused;
    musicToggleBtn.classList.toggle("music-playing", isPlaying);
    musicToggleBtn.setAttribute("aria-pressed", String(isPlaying));
    musicToggleLabel.textContent = isPlaying ? dict.music_on : dict.music_off;
  }

  musicToggleBtn.addEventListener("click", () => {
    if (!bgMusic) return;
    if (bgMusic.paused) {
      musicEnabled = true;
      bgMusic.play().then(updateMusicUI).catch(updateMusicUI);
    } else {
      musicEnabled = false;
      bgMusic.pause();
      updateMusicUI();
    }
  });

  const nilavilakkuBtn = document.getElementById("nilavilakku-btn");
  if (nilavilakkuBtn) {
    nilavilakkuBtn.addEventListener("click", (e) => {
      triggerFlowerSplash(32, e.clientX || window.innerWidth / 2, e.clientY || 160);
    });
  }

  /* =========================================================
     5. SCROLL-DRIVEN KERALA PALM LEAF MANUSCRIPT (THALIYOLA) UNFOLD
  ========================================================= */
  const thaliyolaWrapper = document.getElementById("thaliyola-wrapper");
  const thaliyolaLeaf = document.getElementById("thaliyola-leaf");

  function updateThaliyolaUnfold() {
    if (!thaliyolaWrapper || !thaliyolaLeaf) return;
    const rect = thaliyolaWrapper.getBoundingClientRect();
    const viewH = window.innerHeight || document.documentElement.clientHeight;

    // Progress goes from 0 (when entering bottom of viewport) to 1 (when centered)
    const startPoint = viewH * 0.94;
    const endPoint = viewH * 0.36;
    const rawProgress = (startPoint - rect.top) / (startPoint - endPoint);
    const clamped = Math.max(0, Math.min(1, rawProgress));
    const unfoldScale = 0.22 + clamped * 0.78;

    thaliyolaLeaf.style.setProperty("--unfold", unfoldScale.toFixed(3));
  }

  window.addEventListener("scroll", updateThaliyolaUnfold, { passive: true });
  window.addEventListener("resize", updateThaliyolaUnfold, { passive: true });

  /* =========================================================
     6. SMOOTH SECTION REVEAL OBSERVER
  ========================================================= */
  function initScrollReveal() {
    const sections = document.querySelectorAll(".section-reveal");
    if (!("IntersectionObserver" in window)) {
      sections.forEach((s) => s.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /* =========================================================
     7. INSTANT ATTENDANCE CONFIRMATION (RSVP THANK YOU)
  ========================================================= */
  const rsvpFormBox = document.getElementById("rsvp-form-box");
  const rsvpThankyouBox = document.getElementById("rsvp-thankyou-box");
  const rsvpGuestNameInput = document.getElementById("rsvp-guest-name");
  const rsvpThankyouMsg = document.getElementById("rsvp-thankyou-msg");
  const rsvpConfirmBtn = document.getElementById("rsvp-confirm-btn");
  const rsvpBothBtn = document.getElementById("rsvp-both-btn");
  const rsvpResetBtn = document.getElementById("rsvp-reset-btn");

  function confirmAttendance(e) {
    const dict = window.INVITATION_TRANSLATIONS[currentLang] || window.INVITATION_TRANSLATIONS.en;
    const guestName = rsvpGuestNameInput ? rsvpGuestNameInput.value.trim() : "";

    if (guestName && dict.rsvp_thankyou_named) {
      rsvpThankyouMsg.textContent = dict.rsvp_thankyou_named.replace("{name}", guestName);
    } else {
      rsvpThankyouMsg.textContent = dict.rsvp_thankyou_body;
    }

    rsvpFormBox.classList.add("hidden");
    rsvpThankyouBox.classList.remove("hidden");

    const cx = e && e.clientX ? e.clientX : window.innerWidth / 2;
    const cy = e && e.clientY ? e.clientY : window.innerHeight / 2;
    triggerFlowerSplash(40, cx, cy);
  }

  if (rsvpConfirmBtn) rsvpConfirmBtn.addEventListener("click", confirmAttendance);
  if (rsvpBothBtn) rsvpBothBtn.addEventListener("click", confirmAttendance);
  if (rsvpResetBtn) {
    rsvpResetBtn.addEventListener("click", () => {
      rsvpThankyouBox.classList.add("hidden");
      rsvpFormBox.classList.remove("hidden");
    });
  }

  /* =========================================================
     8. LIVE RECEPTION COUNTDOWN TIMER
  ========================================================= */
  const cdGrid = document.getElementById("countdown-grid");
  const cdCelebration = document.getElementById("countdown-celebration");
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");

  function updateCountdown() {
    const now = Date.now();
    const diff = RECEPTION_START_UTC - now;

    if (diff <= 0) {
      cdGrid.classList.add("hidden");
      cdCelebration.classList.remove("hidden");
      return;
    }

    cdGrid.classList.remove("hidden");
    cdCelebration.classList.add("hidden");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    elDays.textContent = String(days).padStart(2, "0");
    elHours.textContent = String(hours).padStart(2, "0");
    elMinutes.textContent = String(minutes).padStart(2, "0");
    elSeconds.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* =========================================================
     9. AMBIENT PETAL SHOWER & TOUCH BLOOMS
  ========================================================= */
  function spawnFallingPetal() {
    if (!petalCanvas || petalCanvas.childElementCount > 26) return;
    const petal = document.createElement("span");
    petal.className = "falling-petal";

    const size = 9 + Math.random() * 8;
    const startLeft = Math.random() * 100;
    const duration = 6.5 + Math.random() * 5;
    const driftX = (Math.random() - 0.5) * 140;
    const spinDeg = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
    const color = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.75}px`;
    petal.style.left = `${startLeft}%`;
    petal.style.background = color;
    petal.style.setProperty("--drift-x", `${driftX}px`);
    petal.style.setProperty("--spin-deg", `${spinDeg}deg`);
    petal.style.animationDuration = `${duration}s`;

    petalCanvas.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000 + 200);
  }

  let petalInterval = null;
  function startPetalShower() {
    if (petalInterval) return;
    for (let i = 0; i < 10; i++) setTimeout(spawnFallingPetal, i * 220);
    petalInterval = setInterval(spawnFallingPetal, 900);
  }

  document.addEventListener("pointerdown", (e) => {
    if (!bloomLayer || doorOverlay && !doorOverlay.classList.contains("hidden")) return;
    triggerFlowerSplash(10, e.clientX, e.clientY);
  }, { passive: true });

  /* =========================================================
     10. GOOGLE CALENDAR LINKS, WHATSAPP SHARE & LIGHTBOX
  ========================================================= */
  function formatGCalDate(ms) {
    return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }

  function buildGCalUrl(title, startMs, endMs, details, location) {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${formatGCalDate(startMs)}/${formatGCalDate(endMs)}`,
      details,
      location
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const receptionGCal = buildGCalUrl(
    "Wedding Reception — Sreenath & Ashitha",
    RECEPTION_START_UTC,
    RECEPTION_END_UTC,
    "Wedding Reception of Sreenath & Ashitha. Map: https://maps.app.goo.gl/9gu1PoUhj3RtBDAR6",
    "Yahshua Auditorium, Vellarikkundu, Kasaragod"
  );

  const ceremonyGCal = buildGCalUrl(
    "Wedding Ceremony (Muhurtham) — Sreenath & Ashitha",
    CEREMONY_START_UTC,
    CEREMONY_END_UTC,
    "Wedding Ceremony of Sreenath & Ashitha. Map: https://maps.app.goo.gl/2rdjiLCV85t2547aA",
    "Skyland Village, Mattool, Kannur"
  );

  ["gcal-reception-link", "gcal-reception-card-link"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = receptionGCal;
  });
  const cerEl = document.getElementById("gcal-ceremony-link");
  if (cerEl) cerEl.href = ceremonyGCal;

  function shareOnWhatsApp() {
    const dict = window.INVITATION_TRANSLATIONS[currentLang] || window.INVITATION_TRANSLATIONS.en;
    const shareUrl = window.location.href.startsWith("http") ? window.location.href : TARGET_URL;
    const text = encodeURIComponent(dict.whatsapp_text + shareUrl);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  ["hero-whatsapp-btn", "footer-whatsapp-btn"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", shareOnWhatsApp);
  });

  const copyBtn = document.getElementById("copy-link-btn");
  const copyFeedback = document.getElementById("copy-feedback");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const dict = window.INVITATION_TRANSLATIONS[currentLang] || window.INVITATION_TRANSLATIONS.en;
      const urlToCopy = window.location.href.startsWith("http") ? window.location.href : TARGET_URL;
      try {
        await navigator.clipboard.writeText(urlToCopy);
        copyFeedback.textContent = dict.copied_message;
      } catch {
        copyFeedback.textContent = urlToCopy;
      }
    });
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lbClose = document.getElementById("lightbox-close");
  const lbPrev = document.getElementById("lightbox-prev");
  const lbNext = document.getElementById("lightbox-next");

  function openLightbox(index) {
    currentLightboxIdx = (index + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    const item = GALLERY_IMAGES[currentLightboxIdx];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightbox.classList.remove("hidden");
  }

  document.querySelectorAll(".gallery-item").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = Number(el.getAttribute("data-index") || 0);
      openLightbox(idx);
    });
  });

  if (lbClose) lbClose.addEventListener("click", () => lightbox.classList.add("hidden"));
  if (lbPrev) lbPrev.addEventListener("click", () => openLightbox(currentLightboxIdx - 1));
  if (lbNext) lbNext.addEventListener("click", () => openLightbox(currentLightboxIdx + 1));
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) lightbox.classList.add("hidden");
    });
  }
})();
