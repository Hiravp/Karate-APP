(() => {
  const kataLibrary = [
    {
      id: "sanchin",
      name: "Sanchin",
      meaning: "Three battles",
      stance: "Sanchin dachi",
      tempo: "Slow, rooted, breath-led",
      targetMotion: 0.32,
      targetStability: 0.88,
      model: {
        stanceWidth: 0.38,
        hipRotation: -6,
        shoulderRotation: 6,
        guardHeight: 0.74,
        forwardPressure: 0.45
      },
      checkpoints: [
        "Keep knees pressed inward with the pelvis tucked.",
        "Drive punches from the lats while keeping elbows close.",
        "Coordinate ibuki breathing with every step and strike."
      ],
      corrections: [
        {
          metric: "stability",
          threshold: 0.78,
          priority: "Rooting",
          title: "Lower your center and lock the stance.",
          detail:
            "Sanchin needs quiet hips and steady foot pressure. Bend the knees, tuck the pelvis, and reduce upper-body sway."
        },
        {
          metric: "motion",
          threshold: 0.52,
          priority: "Tempo",
          title: "Slow the movement and show tension.",
          detail:
            "Your motion is too large for Sanchin. Compress the step, keep elbows connected, and let breath set the pace."
        },
        {
          metric: "guard",
          threshold: 0.66,
          priority: "Guard",
          title: "Raise the guard to the solar plexus line.",
          detail:
            "The model is showing the hands drifting low. Keep forearms in front of the ribs and fists on center."
        }
      ]
    },
    {
      id: "gekisai-dai-ichi",
      name: "Gekisai Dai Ichi",
      meaning: "Attack and smash number one",
      stance: "Zenkutsu dachi and shiko dachi transitions",
      tempo: "Sharp blocks, committed stepping",
      targetMotion: 0.62,
      targetStability: 0.7,
      model: {
        stanceWidth: 0.56,
        hipRotation: 16,
        shoulderRotation: -12,
        guardHeight: 0.68,
        forwardPressure: 0.7
      },
      checkpoints: [
        "Snap gedan barai and jodan uke to a clear stop.",
        "Use hip rotation before the reverse punch lands.",
        "Settle into shiko dachi before the elbow and backfist."
      ],
      corrections: [
        {
          metric: "motion",
          threshold: 0.46,
          priority: "Power",
          title: "Commit more body mass into the line.",
          detail:
            "This kata should read as decisive. Step through the floor, rotate the hips, and finish each block sharply."
        },
        {
          metric: "stability",
          threshold: 0.58,
          priority: "Balance",
          title: "Stabilize before changing direction.",
          detail:
            "The motion trace is wobbling during turns. Land the foot, align knee over toes, then fire the next technique."
        },
        {
          metric: "guard",
          threshold: 0.6,
          priority: "Chamber",
          title: "Return the non-striking hand to chamber.",
          detail:
            "Keep hikite active. Pull the opposite fist to the ribs so the model can show a stronger shoulder line."
        }
      ]
    },
    {
      id: "saifa",
      name: "Saifa",
      meaning: "Smash and tear",
      stance: "Neko ashi dachi, zenkutsu dachi, and close-range turns",
      tempo: "Whip-like acceleration",
      targetMotion: 0.72,
      targetStability: 0.64,
      model: {
        stanceWidth: 0.48,
        hipRotation: -22,
        shoulderRotation: 24,
        guardHeight: 0.62,
        forwardPressure: 0.58
      },
      checkpoints: [
        "Keep the cat stance light before the explosive release.",
        "Use tearing hands with shoulder rotation, not arm strength alone.",
        "Make the close-range strikes compact and sudden."
      ],
      corrections: [
        {
          metric: "motion",
          threshold: 0.56,
          priority: "Explosiveness",
          title: "Add a sharper acceleration phase.",
          detail:
            "Saifa needs contrast. Stay relaxed in the setup, then whip the torso and hands together at the finish."
        },
        {
          metric: "stability",
          threshold: 0.5,
          priority: "Footwork",
          title: "Control the cat stance before releasing.",
          detail:
            "The model detected unstable weight transfer. Keep the rear leg loaded and place the front foot lightly."
        },
        {
          metric: "guard",
          threshold: 0.58,
          priority: "Structure",
          title: "Keep elbows connected during tearing motions.",
          detail:
            "Avoid reaching with the hands. Rotate the torso and keep the elbows heavy so the technique stays close-range."
        }
      ]
    },
    {
      id: "seiyunchin",
      name: "Seiyunchin",
      meaning: "Control, pull, and fight",
      stance: "Deep shiko dachi",
      tempo: "Heavy, grounded, pulling power",
      targetMotion: 0.44,
      targetStability: 0.82,
      model: {
        stanceWidth: 0.72,
        hipRotation: 8,
        shoulderRotation: -8,
        guardHeight: 0.58,
        forwardPressure: 0.38
      },
      checkpoints: [
        "Sink evenly into shiko dachi without leaning forward.",
        "Pull with the back and hips before the hands finish.",
        "Keep the spine tall through slow tension sequences."
      ],
      corrections: [
        {
          metric: "stability",
          threshold: 0.72,
          priority: "Depth",
          title: "Sink into shiko dachi and level the hips.",
          detail:
            "Seiyunchin depends on a low, even base. Widen the feet, open the knees, and keep the spine stacked."
        },
        {
          metric: "motion",
          threshold: 0.6,
          priority: "Control",
          title: "Reduce bouncing between techniques.",
          detail:
            "Keep the head height steady. Pull from the waist and finish without popping up out of the stance."
        },
        {
          metric: "guard",
          threshold: 0.55,
          priority: "Pulling line",
          title: "Finish pulls on the centerline.",
          detail:
            "The reference model is showing the hands moving outside the body. Draw elbows back along the ribs."
        }
      ]
    }
  ];

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function getKataById(id) {
    return kataLibrary.find((kata) => kata.id === id) || kataLibrary[0];
  }

  function createMotionSample({ motion = 0, stability = 0, guard = 0, confidence = 0, timestamp = Date.now() } = {}) {
    return {
      motion: clamp(motion),
      stability: clamp(stability),
      guard: clamp(guard),
      confidence: clamp(confidence),
      timestamp
    };
  }

  function scoreKataPerformance(kata, sample) {
    const motionFit = 1 - Math.abs(kata.targetMotion - sample.motion);
    const stabilityFit = 1 - Math.abs(kata.targetStability - sample.stability);
    const guardFit = sample.guard;
    const confidenceWeight = Math.max(0.35, sample.confidence);

    return Math.round(
      clamp((motionFit * 0.35 + stabilityFit * 0.35 + guardFit * 0.3) * confidenceWeight) * 100
    );
  }

  function chooseCorrection(kata, sample) {
    const missingCorrection = kata.corrections.find((correction) => {
      if (correction.metric === "motion") {
        return sample.motion < correction.threshold || sample.motion > kata.targetMotion + 0.22;
      }

      return sample[correction.metric] < correction.threshold;
    });

    if (missingCorrection) {
      return { ...missingCorrection, isPositive: false };
    }

    return {
      priority: "Good match",
      title: `Your ${kata.name} shape is close to the reference.`,
      detail:
        "Keep the same stance height, breathing rhythm, and hip connection while moving through the next sequence.",
      metric: "overall",
      threshold: 1,
      isPositive: true
    };
  }

  function deriveModelState(kata, sample) {
    const motionDelta = sample.motion - kata.targetMotion;
    const stabilityDelta = kata.targetStability - sample.stability;
    const guardDelta = kata.model.guardHeight - sample.guard;

    return {
      stanceWidth: clamp(kata.model.stanceWidth + stabilityDelta * 0.18, 0.28, 0.82),
      hipRotation: kata.model.hipRotation + motionDelta * 28,
      shoulderRotation: kata.model.shoulderRotation - motionDelta * 24,
      guardHeight: clamp(kata.model.guardHeight - guardDelta * 0.35, 0.44, 0.82),
      forwardPressure: clamp(kata.model.forwardPressure + sample.motion * 0.15, 0.2, 0.9),
      correctionLean: clamp(stabilityDelta, -0.25, 0.25)
    };
  }

  function analyzeKataFrame(kata, sample) {
    const normalizedSample = createMotionSample(sample);
    const correction = chooseCorrection(kata, normalizedSample);

    return {
      sample: normalizedSample,
      correction,
      score: scoreKataPerformance(kata, normalizedSample),
      model: deriveModelState(kata, normalizedSample)
    };
  }

  function estimateMotionFromFrames(previousFrame, currentFrame, options = {}) {
    if (!previousFrame || !currentFrame || previousFrame.length !== currentFrame.length) {
      return createMotionSample({ confidence: 0 });
    }

    const stride = options.stride || 16;
    let changed = 0;
    let total = 0;
    let verticalEnergy = 0;
    let upperFrameEnergy = 0;

    for (let index = 0; index < currentFrame.length; index += 4 * stride) {
      const redDiff = Math.abs(currentFrame[index] - previousFrame[index]);
      const greenDiff = Math.abs(currentFrame[index + 1] - previousFrame[index + 1]);
      const blueDiff = Math.abs(currentFrame[index + 2] - previousFrame[index + 2]);
      const delta = (redDiff + greenDiff + blueDiff) / (255 * 3);
      const pixelIndex = index / 4;
      const y = Math.floor(pixelIndex / options.width);
      const verticalPosition = options.height ? y / options.height : 0.5;

      changed += delta;
      total += 1;
      verticalEnergy += delta * verticalPosition;

      if (verticalPosition < 0.58) {
        upperFrameEnergy += delta;
      }
    }

    const motion = clamp(total ? (changed / total) * 4 : 0);
    const verticalCenter = changed ? verticalEnergy / changed : 0.5;
    const stability = clamp(1 - Math.abs(verticalCenter - 0.56) * 1.6 - motion * 0.18);
    const guard = clamp(total ? (upperFrameEnergy / total) * 5.4 : 0.5);
    const confidence = clamp(motion * 1.4 + 0.18, 0.15, 0.96);

    return createMotionSample({ motion, stability, guard, confidence });
  }

  function initializeApp() {
    const kataSelect = document.querySelector("#kata-select");
    const kataBadge = document.querySelector("#current-kata-badge");
    const kataBreakdown = document.querySelector("#kata-breakdown");
    const cameraToggle = document.querySelector("#camera-toggle");
    const video = document.querySelector("#camera-feed");
    const canvas = document.querySelector("#motion-canvas");
    const placeholder = document.querySelector("#camera-placeholder");
    const cameraDiagnostics = document.querySelector("#camera-diagnostics");
    const appStatus = document.querySelector("#app-status");
    const motionScore = document.querySelector("#motion-score");
    const stabilityScore = document.querySelector("#stability-score");
    const confidenceScore = document.querySelector("#confidence-score");
    const correctionPriority = document.querySelector("#correction-priority");
    const primaryCorrection = document.querySelector("#primary-correction");
    const correctionDetail = document.querySelector("#correction-detail");
    const bodyModel = document.querySelector("#body-model");
    const context = canvas && canvas.getContext ? canvas.getContext("2d", { willReadFrequently: true }) : null;

    if (!context) {
      if (appStatus) appStatus.textContent = "Canvas is unavailable in this browser.";
      if (placeholder) {
        placeholder.innerHTML = "<strong>Browser unsupported</strong><span>This browser cannot render the motion canvas.</span>";
      }
      return;
    }

    let selectedKata = kataLibrary[0];
    let stream = null;
    let previousFrame = null;
    let animationFrame = null;
    let demoPhase = 0;

    function setStatus(message) {
      appStatus.textContent = message;
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, (character) => {
        const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
        return replacements[character];
      });
    }

    function isLocalBrowserOrigin() {
      return ["localhost", "127.0.0.1", "::1", "[::1]", ""].includes(window.location.hostname);
    }

    function isCameraSecureContext() {
      return window.isSecureContext || window.location.protocol === "https:" || isLocalBrowserOrigin();
    }

    function getCameraAccessMessage(error) {
      if (!isCameraSecureContext()) {
        return "Chrome blocks camera access unless the app is opened from http://localhost, http://127.0.0.1, or HTTPS.";
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return "This browser does not expose camera access to this page. Open it in current Google Chrome from http://localhost:4173.";
      }

      if (!error) {
        return "Ready for your real Chrome camera. Click Start camera and allow permission when Chrome asks.";
      }

      if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        return "Chrome denied camera permission. Click the camera/lock icon in the address bar, allow Camera, then press Start camera again.";
      }

      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        return "Chrome could not find a webcam. Check that your camera is connected and enabled in your computer settings.";
      }

      if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        return "Chrome found the camera but could not start it. Close Zoom, Teams, or any other app using the webcam, then try again.";
      }

      if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
        return "Your camera did not support the requested size or facing mode. The app will retry with Chrome's default webcam settings.";
      }

      return error.message || "Chrome could not start the webcam. Check browser permissions and try again.";
    }

    async function getCameraDeviceCount() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return null;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((device) => device.kind === "videoinput").length;
      } catch (_error) {
        return null;
      }
    }

    async function renderCameraDiagnostics({ mode = "ready", error = null } = {}) {
      const cameraCount = await getCameraDeviceCount();
      const secure = isCameraSecureContext();
      const hasApi = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const pageAddress = window.location.protocol === "file:" ? "a local file" : window.location.href;
      const accessMessage = getCameraAccessMessage(error);
      const statusClass = mode === "active" ? "ok" : error ? "error" : "warn";
      const cameraLine = cameraCount === null ? "Camera list unavailable until permission is granted" : `${cameraCount} camera${cameraCount === 1 ? "" : "s"} visible to Chrome`;

      cameraDiagnostics.innerHTML = `
        <strong>Real Chrome camera status</strong>
        <ul>
          <li class="${secure ? "ok" : "error"}">Page address: ${escapeHtml(pageAddress)}</li>
          <li class="${secure ? "ok" : "error"}">Secure camera context: ${secure ? "yes" : "no"}</li>
          <li class="${hasApi ? "ok" : "error"}">Chrome camera API: ${hasApi ? "available" : "blocked"}</li>
          <li class="${cameraCount && cameraCount > 0 ? "ok" : "warn"}">${escapeHtml(cameraLine)}</li>
          <li class="${statusClass}">${escapeHtml(accessMessage)}</li>
        </ul>
      `;
    }

    async function requestCameraStream() {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (error) {
        if (error.name !== "OverconstrainedError" && error.name !== "ConstraintNotSatisfiedError") {
          throw error;
        }

        await renderCameraDiagnostics({ mode: "retrying", error });
        return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
    }

    function formatPercent(value) {
      return `${Math.round(value * 100)}%`;
    }

    function populateKataSelect() {
      kataSelect.innerHTML = kataLibrary
        .map((kata) => `<option value="${kata.id}">${kata.name}</option>`)
        .join("");
    }

    function renderKataDetails(kata) {
      kataBadge.textContent = kata.name;
      kataBreakdown.innerHTML = `
        <article>
          <span>Meaning</span>
          <strong>${kata.meaning}</strong>
        </article>
        <article>
          <span>Primary stance</span>
          <strong>${kata.stance}</strong>
        </article>
        <article>
          <span>Tempo</span>
          <strong>${kata.tempo}</strong>
        </article>
        <ul>
          ${kata.checkpoints.map((checkpoint) => `<li>${checkpoint}</li>`).join("")}
        </ul>
      `;
    }

    function applyModelState(model) {
      bodyModel.style.setProperty("--stance-width", model.stanceWidth.toFixed(2));
      bodyModel.style.setProperty("--hip-rotation", `${model.hipRotation.toFixed(1)}deg`);
      bodyModel.style.setProperty("--shoulder-rotation", `${model.shoulderRotation.toFixed(1)}deg`);
      bodyModel.style.setProperty("--guard-height", model.guardHeight.toFixed(2));
      bodyModel.style.setProperty("--forward-pressure", model.forwardPressure.toFixed(2));
      bodyModel.style.setProperty("--correction-lean", `${(model.correctionLean * 18).toFixed(1)}deg`);
    }

    function renderAnalysis(analysis) {
      motionScore.textContent = formatPercent(analysis.sample.motion);
      stabilityScore.textContent = formatPercent(analysis.sample.stability);
      confidenceScore.textContent = formatPercent(analysis.sample.confidence);

      correctionPriority.textContent = analysis.correction.priority;
      correctionPriority.classList.toggle("positive", analysis.correction.isPositive);
      correctionPriority.classList.toggle("warning", !analysis.correction.isPositive);
      primaryCorrection.textContent = analysis.correction.title;
      correctionDetail.textContent = analysis.correction.detail;
      applyModelState(analysis.model);
    }

    function createDemoSample() {
      demoPhase += 0.03;
      return {
        motion: selectedKata.targetMotion + Math.sin(demoPhase) * 0.16,
        stability: selectedKata.targetStability - 0.18 + Math.cos(demoPhase * 0.7) * 0.12,
        guard: selectedKata.model.guardHeight - 0.08 + Math.sin(demoPhase * 1.3) * 0.18,
        confidence: 0.62 + Math.sin(demoPhase * 0.5) * 0.18
      };
    }

    function drawGuideOverlay() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "rgba(95, 211, 255, 0.85)";
      context.lineWidth = 3;
      context.setLineDash([10, 8]);
      context.strokeRect(canvas.width * 0.3, canvas.height * 0.08, canvas.width * 0.4, canvas.height * 0.86);
      context.setLineDash([]);
      context.fillStyle = "rgba(255, 255, 255, 0.75)";
      context.font = "16px system-ui, sans-serif";
      context.fillText("Fit full body inside the guide", 24, 34);
    }

    function analyzeCameraFrame() {
      if (!stream || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        animationFrame = requestAnimationFrame(analyzeCameraFrame);
        return;
      }

      const width = canvas.width;
      const height = canvas.height;
      context.drawImage(video, 0, 0, width, height);
      const frame = context.getImageData(0, 0, width, height);
      const sample = estimateMotionFromFrames(previousFrame && previousFrame.data, frame.data, {
        width,
        height,
        stride: 20
      });
      previousFrame = frame;

      renderAnalysis(analyzeKataFrame(selectedKata, sample));
      drawGuideOverlay();
      animationFrame = requestAnimationFrame(analyzeCameraFrame);
    }

    function runDemoLoop() {
      if (stream) return;
      renderAnalysis(analyzeKataFrame(selectedKata, createDemoSample()));
      animationFrame = requestAnimationFrame(runDemoLoop);
    }

    async function startCamera() {
      await renderCameraDiagnostics();

      if (!isCameraSecureContext() || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        placeholder.hidden = false;
        placeholder.innerHTML = `
          <strong>Open in Chrome from localhost or HTTPS</strong>
          <span>On your computer run npm start, then open http://localhost:4173 in Google Chrome. Demo mode is still running.</span>
        `;
        setStatus("Demo mode active; Chrome requires localhost or HTTPS for the real camera.");
        await renderCameraDiagnostics({ mode: "blocked" });
        runDemoLoop();
        return;
      }

      try {
        cameraToggle.disabled = true;
        cameraToggle.textContent = "Starting camera...";
        setStatus("Waiting for Chrome camera permission...");
        stream = await requestCameraStream();
        video.srcObject = stream;
        await video.play();
        placeholder.hidden = true;
        cameraToggle.disabled = false;
        cameraToggle.textContent = "Stop camera";
        setStatus("Real Chrome camera active; video stays on your device.");
        await renderCameraDiagnostics({ mode: "active" });
        previousFrame = null;
        cancelAnimationFrame(animationFrame);
        analyzeCameraFrame();
      } catch (error) {
        stream = null;
        video.srcObject = null;
        cameraToggle.disabled = false;
        cameraToggle.textContent = "Start camera";
        placeholder.hidden = false;
        placeholder.innerHTML = `
          <strong>Camera unavailable in Chrome</strong>
          <span>${escapeHtml(getCameraAccessMessage(error))} Demo analysis is still running.</span>
        `;
        setStatus("Demo mode active; Chrome could not start the real camera.");
        await renderCameraDiagnostics({ mode: "error", error });
        runDemoLoop();
      }
    }

    function stopCamera() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      stream = null;
      video.srcObject = null;
      placeholder.hidden = false;
      cameraToggle.textContent = "Start camera";
      setStatus("Demo mode active; no video leaves your device.");
      renderCameraDiagnostics();
      previousFrame = null;
      cancelAnimationFrame(animationFrame);
      runDemoLoop();
    }

    function handleKataChange(event) {
      selectedKata = getKataById(event.target.value);
      renderKataDetails(selectedKata);
      renderAnalysis(analyzeKataFrame(selectedKata, createDemoSample()));
    }

    populateKataSelect();
    kataSelect.value = selectedKata.id;
    renderKataDetails(selectedKata);
    renderAnalysis(analyzeKataFrame(selectedKata, createDemoSample()));
    setStatus("Demo mode active; start camera for live motion sensing.");
    renderCameraDiagnostics();
    runDemoLoop();

    kataSelect.addEventListener("change", handleKataChange);
    cameraToggle.addEventListener("click", () => {
      if (stream) {
        stopCamera();
      } else {
        startCamera();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
