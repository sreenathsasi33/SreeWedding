(function () {
  const TARGET_URL = "https://sreenathsasi33.github.io/wedding-invitation/";

  const RECEPTION_START_UTC = Date.UTC(2027, 0, 25, 11, 0, 0);
  const RECEPTION_END_UTC   = Date.UTC(2027, 0, 25, 15, 0, 0);

  const CEREMONY_START_UTC  = Date.UTC(2027, 0, 24, 5, 0, 0);
  const CEREMONY_END_UTC    = Date.UTC(2027, 0, 24, 6, 0, 0);

  const GALLERY_IMAGES = [
    { src: "assets/images/couple-1.jpg", alt: "Sreenath and Ashitha evening portrait" },
    { src: "assets/images/couple-2.jpg", alt: "Sreenath and Ashitha night lights portrait" },
    { src: "assets/images/couple-3.jpg", alt: "Sreenath and Ashitha together" },
    { src: "assets/images/couple-4.jpg", alt: "Sreenath and Ashitha in traditional Kerala attire" },
    { src: "assets/images/couple-5.jpg", alt: "Ashitha smiling candidly with Sreenath" },
    { src: "assets/images/couple-6.jpg", alt: "Sreenath smiling candidly with Ashitha" }
  ];

  let currentLang = "en";
  let musicEnabled = true;
  let currentLightboxIdx = 0;

  const doorOverlay = document.getElementById("door-overlay");
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

  let doorOpened = false;

  function openWoodenDoors() {
    if (doorOpened) return;
    doorOpened = true;

    doorOverlay.classList.add("doors-opening");
    burstPetals(28);

    if (bgMusic && musicEnabled) {
      bgMusic.volume = 0.75;
      bgMusic.play().catch(() => {
        musicEnabled = false;
        updateMusicUI();
      });
    }

    setTimeout(() => {
      doorOverlay.classList.add("fade-out");
      setTimeout(() => {
        doorOverlay.classList.add("hidden");
        languageOverlay.classList.remove("hidden");
      }, 650);
    }, 1250);
  }

  doorTrigger.addEventListener("click", openWoodenDoors);
  doorTrigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openWoodenDoors();
    }
  });

  document.querySelectorAll("[data-select-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.getAttribute("data-select-lang");
      setLanguage(selected);
      languageOverlay.classList.add("hidden");
      document.body.classList.remove("state-doors-locked");
      invitationMain.classList.remove("hidden");
      floatingControls.classList.remove("hidden");
      startPetalShower();
    });
  });

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

    langToggleLabel.textContent = dict.lang_switch_label;
    updateMusicUI();
  }

  langToggleBtn.addEventListener("click", () => {
    setLanguage(currentLang === "en" ? "ml" : "en");
  });

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

  const PETAL_COLORS = ["#fffdf7", "#f9e79f", "#f5b7b1", "#fadbd8", "#e5b95c"];

  function spawnFallingPetal() {
    if (!petalCanvas || petalCanvas.childElementCount > 24) return;
    const petal = document.createElement("span");
    petal.className = "falling-petal";

    const size = 9 + Math.random() * 8;
    const startLeft = Math.random() * 100;
    const duration = 6.5 + Math.random() * 5;
    const driftX = (Math.random() - 0.5) * 140;
    const spinDeg = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
    const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];

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
    for (let i = 0; i < 8; i++) setTimeout(spawnFallingPetal, i * 250);
    petalInterval = setInterval(spawnFallingPetal, 950);
  }

  function burstPetals(count = 10) {
    for (let i = 0; i < count; i++) {
      setTimeout(spawnFallingPetal, i * 45);
    }
  }

  document.addEventListener("pointerdown", (e) => {
    if (!bloomLayer) return;
    const x = e.clientX;
    const y = e.clientY;
    const count = 9;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
      const dist = 28 + Math.random() * 36;
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * dist;
      const rot = Math.round((angle * 180) / Math.PI) + 45;

      const p = document.createElement("span");
      p.className = "click-bloom";
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;
      p.style.background = PETAL_COLORS[i % PETAL_COLORS.length];
      p.style.setProperty("--bx", `${bx.toFixed(1)}px`);
      p.style.setProperty("--by", `${by.toFixed(1)}px`);
      p.style.setProperty("--brot", `${rot}deg`);

      bloomLayer.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }
  }, { passive: true });

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
