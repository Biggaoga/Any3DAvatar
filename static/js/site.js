(() => {
  "use strict";

  const splatModel = (id) =>
    `https://huggingface.co/datasets/annoymity/anonymousply/resolve/main/model${id}.ply`;

  const reconstructionExamples = [
    { input: "./static/images/in1.png", video: "./static/videos/video1.mp4", splat: splatModel(1) },
    { input: "./static/images/in2.png", video: "./static/videos/video2.mp4", splat: splatModel(2) },
    { input: "./static/images/in4.png", video: "./static/videos/video4.mp4", splat: splatModel(4) },
    { input: "./static/images/in20.png", video: "./static/videos/video20.mp4", splat: splatModel(20) },
    { input: "./static/images/in7.png", video: "./static/videos/video7.mp4", splat: splatModel(7) },
    { input: "./static/images/in12.png", video: "./static/videos/video12.mp4", splat: splatModel(12) },
    { input: "./static/images/in14.png", video: "./static/videos/video14.mp4", splat: splatModel(14) },
    { input: "./static/images/in15.png", video: "./static/videos/video15.mp4", splat: splatModel(15) },
    { input: "./static/images/in16.png", video: "./static/videos/video16.mp4", splat: splatModel(16) },
    { input: "./static/images/in17.png", video: "./static/videos/video17.mp4", splat: splatModel(17) },
    { input: "./static/images/in18.png", video: "./static/videos/video18.mp4", splat: splatModel(18) },
    { input: "./static/images/in19.png", video: "./static/videos/video19.mp4", splat: splatModel(19) },
  ];

  const comparisonExamples = {
    baselines: {
      source: "./static/videos/comparison_video-page.mp4",
      overline: "Evaluation against full-head baselines",
      description:
        "Side-by-side novel views emphasize identity consistency, back-of-head completion, hair, clothing, and fine facial structure.",
      label: "Qualitative comparison against full-head reconstruction baselines",
    },
    image3d: {
      source: "./static/videos/comparison_with_123D.mp4",
      overline: "Comparison with general image-to-3D methods",
      description:
        "This view contrasts specialized full-head reconstruction with general image-to-3D systems under the same portrait-driven setting.",
      label: "Qualitative comparison with general image-to-3D methods",
    },
    video360: {
      source: "./static/videos/comparison_with_diffportrait360.mp4",
      overline: "Comparison with 360-degree portrait generation",
      description:
        "The comparison focuses on cross-view consistency and complete head appearance over a full novel-view trajectory.",
      label: "Qualitative comparison with 360-degree portrait generation methods",
    },
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionToggle = document.querySelector("#motion-toggle");
  const videoVisibility = new Map();
  let motionPaused = reducedMotion.matches;

  function playVideo(video) {
    if (motionPaused || !videoVisibility.get(video)) return;
    const playRequest = video.play();
    if (playRequest) playRequest.catch(() => {});
  }

  function pauseAllVideos() {
    document.querySelectorAll("video").forEach((video) => video.pause());
  }

  function updateMotionToggle() {
    if (!motionToggle) return;
    motionToggle.setAttribute("aria-pressed", String(motionPaused));
    motionToggle.textContent = motionPaused ? "Resume motion" : "Pause motion";
  }

  function setMotionPaused(nextState) {
    motionPaused = nextState;
    updateMotionToggle();

    if (motionPaused) {
      pauseAllVideos();
      return;
    }

    document.querySelectorAll("video").forEach((video) => playVideo(video));
  }

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        videoVisibility.set(video, entry.isIntersecting);
        if (entry.isIntersecting) playVideo(video);
        else video.pause();
      });
    },
    { threshold: 0.35 },
  );

  function observeVideo(video) {
    if (!video || video.dataset.observed === "true") return;
    video.dataset.observed = "true";
    videoObserver.observe(video);
  }

  document.querySelectorAll("video").forEach(observeVideo);
  updateMotionToggle();

  motionToggle?.addEventListener("click", () => {
    setMotionPaused(!motionPaused);
  });

  reducedMotion.addEventListener?.("change", (event) => {
    if (event.matches) setMotionPaused(true);
  });

  const explorerInput = document.querySelector("#explorer-input");
  const explorerVideo = document.querySelector("#explorer-video");
  const explorerSplat = document.querySelector("#explorer-splat");
  const explorerStatus = document.querySelector("#explorer-status");
  const identityStrip = document.querySelector("#identity-strip");
  const explorerPrevious = document.querySelector("#explorer-prev");
  const explorerNext = document.querySelector("#explorer-next");
  const splatPanel = document.querySelector("#explorer-splat-panel");
  const splatExpand = document.querySelector("#splat-expand");
  const splatModal = document.querySelector("#splat-modal");
  let activeExample = 0;

  function openSplatModal() {
    if (!explorerSplat || !splatModal || !splatPanel) return;
    splatPanel.classList.add("is-expanded");
    splatModal.hidden = false;
    document.body.classList.add("splat-modal-open");
    splatExpand.textContent = "× Close";
    splatExpand.setAttribute("aria-label", "Close enlarged 3D view");
    splatExpand.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => explorerSplat.focus());
  }

  function closeSplatModal() {
    if (!explorerSplat || !splatModal || !splatPanel || splatModal.hidden) return;
    splatPanel.classList.remove("is-expanded");
    splatModal.hidden = true;
    document.body.classList.remove("splat-modal-open");
    splatExpand.textContent = "⛶ Enlarge";
    splatExpand.setAttribute("aria-label", "Open interactive 3D view in a large window");
    splatExpand.setAttribute("aria-expanded", "false");
    splatExpand?.focus();
  }

  splatExpand?.addEventListener("click", () => {
    if (splatModal?.hidden) openSplatModal();
    else closeSplatModal();
  });
  explorerSplat?.addEventListener("pointerenter", () => explorerSplat.focus());
  splatModal?.querySelector("[data-close-splat]")?.addEventListener("click", closeSplatModal);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && splatModal && !splatModal.hidden) closeSplatModal();
  });

  function changeVideoSource(video, sourcePath) {
    const source = video?.querySelector("source");
    if (!video || !source || source.getAttribute("src") === sourcePath) return;

    video.pause();
    source.setAttribute("src", sourcePath);
    video.load();
    video.addEventListener("canplay", () => playVideo(video), { once: true });
  }

  function changeSplatSource(frame, sourcePath) {
    if (!frame) return;
    const modelUrl = sourcePath ? new URL(sourcePath, window.location.href).href : "";
    const nextSource = `./splat/index.html?url=${encodeURIComponent(modelUrl)}`;
    if (frame.getAttribute("src") !== nextSource) frame.setAttribute("src", nextSource);
  }

  function showReconstruction(index, focusSelected = false) {
    activeExample = (index + reconstructionExamples.length) % reconstructionExamples.length;
    const example = reconstructionExamples[activeExample];

    explorerInput.src = example.input;
    explorerInput.alt = `Input portrait for reconstruction example ${activeExample + 1}`;
    changeVideoSource(explorerVideo, example.video);
    changeSplatSource(explorerSplat, example.splat);
    explorerVideo.setAttribute(
      "title",
      `Novel-view turntable for reconstruction example ${activeExample + 1}`,
    );
    explorerSplat?.setAttribute(
      "title",
      `Interactive 3D Gaussian for reconstruction example ${activeExample + 1}`,
    );
    explorerStatus.textContent = `Example ${String(activeExample + 1).padStart(2, "0")} of ${
      reconstructionExamples.length
    }`;

    const buttons = identityStrip?.querySelectorAll(".identity-button") ?? [];
    buttons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === activeExample;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focusSelected) button.focus();
    });
  }

  reconstructionExamples.forEach((example, index) => {
    const button = document.createElement("button");
    const image = document.createElement("img");

    button.type = "button";
    button.className = "identity-button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-label", `Show reconstruction example ${index + 1}`);
    button.setAttribute("aria-selected", String(index === 0));
    button.tabIndex = index === 0 ? 0 : -1;
    image.src = example.input;
    image.alt = "";
    image.loading = "lazy";
    button.append(image);
    button.addEventListener("click", () => showReconstruction(index));
    identityStrip?.append(button);
  });

  showReconstruction(0);

  explorerPrevious?.addEventListener("click", () => showReconstruction(activeExample - 1, true));
  explorerNext?.addEventListener("click", () => showReconstruction(activeExample + 1, true));

  identityStrip?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    showReconstruction(activeExample + direction, true);
  });

  const comparisonTabs = Array.from(document.querySelectorAll("[data-comparison]"));
  const comparisonPanel = document.querySelector("#comparison-panel");
  const comparisonVideo = document.querySelector("#comparison-video");
  const comparisonOverline = document.querySelector("#comparison-overline");
  const comparisonDescription = document.querySelector("#comparison-description");

  function showComparison(key, focusSelected = false) {
    const comparison = comparisonExamples[key];
    if (!comparison) return;

    comparisonTabs.forEach((tab) => {
      const selected = tab.dataset.comparison === key;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected) {
        comparisonPanel?.setAttribute("aria-labelledby", tab.id);
        if (focusSelected) tab.focus();
      }
    });

    comparisonOverline.textContent = comparison.overline;
    comparisonDescription.textContent = comparison.description;
    comparisonVideo.setAttribute("title", comparison.label);
    changeVideoSource(comparisonVideo, comparison.source);
  }

  comparisonTabs.forEach((tab) => {
    tab.addEventListener("click", () => showComparison(tab.dataset.comparison));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const currentIndex = comparisonTabs.indexOf(tab);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + comparisonTabs.length) % comparisonTabs.length;
      showComparison(comparisonTabs[nextIndex].dataset.comparison, true);
    });
  });

  const navigationLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const navigationSections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visibleEntry) return;

      navigationLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${visibleEntry.target.id}`;
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.2, 0.5] },
  );

  navigationSections.forEach((section) => sectionObserver.observe(section));
})();
