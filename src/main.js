import { analyzeKataFrame, estimateMotionFromFrames } from "./analysisEngine.js";
import { kataLibrary, getKataById } from "./kataLibrary.js";

const kataSelect = document.querySelector("#kata-select");
const kataBadge = document.querySelector("#current-kata-badge");
const kataBreakdown = document.querySelector("#kata-breakdown");
const cameraToggle = document.querySelector("#camera-toggle");
const video = document.querySelector("#camera-feed");
const canvas = document.querySelector("#motion-canvas");
const placeholder = document.querySelector("#camera-placeholder");
const motionScore = document.querySelector("#motion-score");
const stabilityScore = document.querySelector("#stability-score");
const confidenceScore = document.querySelector("#confidence-score");
const correctionPriority = document.querySelector("#correction-priority");
const primaryCorrection = document.querySelector("#primary-correction");
const correctionDetail = document.querySelector("#correction-detail");
const bodyModel = document.querySelector("#body-model");

const context = canvas.getContext("2d", { willReadFrequently: true });
let selectedKata = kataLibrary[0];
let stream = null;
let previousFrame = null;
let animationFrame = null;
let demoPhase = 0;

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
  const sample = estimateMotionFromFrames(previousFrame?.data, frame.data, { width, height, stride: 20 });
  previousFrame = frame;

  renderAnalysis(analyzeKataFrame(selectedKata, sample));
  drawGuideOverlay();
  animationFrame = requestAnimationFrame(analyzeCameraFrame);
}

function runDemoLoop() {
  if (stream) {
    return;
  }

  renderAnalysis(analyzeKataFrame(selectedKata, createDemoSample()));
  animationFrame = requestAnimationFrame(runDemoLoop);
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    video.srcObject = stream;
    placeholder.hidden = true;
    cameraToggle.textContent = "Stop camera";
    previousFrame = null;
    cancelAnimationFrame(animationFrame);
    analyzeCameraFrame();
  } catch (error) {
    stream = null;
    placeholder.hidden = false;
    placeholder.innerHTML = `
      <strong>Camera unavailable</strong>
      <span>${error.message}. Demo analysis is still running.</span>
    `;
    runDemoLoop();
  }
}

function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  video.srcObject = null;
  placeholder.hidden = false;
  cameraToggle.textContent = "Start camera";
  previousFrame = null;
  cancelAnimationFrame(animationFrame);
  runDemoLoop();
}

function handleKataChange(event) {
  selectedKata = getKataById(event.target.value);
  renderKataDetails(selectedKata);
  renderAnalysis(analyzeKataFrame(selectedKata, createDemoSample()));
}

function initializeApp() {
  populateKataSelect();
  kataSelect.value = selectedKata.id;
  renderKataDetails(selectedKata);
  renderAnalysis(analyzeKataFrame(selectedKata, createDemoSample()));
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

initializeApp();
