const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function createMotionSample({
  motion = 0,
  stability = 0,
  guard = 0,
  confidence = 0,
  timestamp = Date.now()
} = {}) {
  return {
    motion: clamp(motion),
    stability: clamp(stability),
    guard: clamp(guard),
    confidence: clamp(confidence),
    timestamp
  };
}

export function scoreKataPerformance(kata, sample) {
  const motionFit = 1 - Math.abs(kata.targetMotion - sample.motion);
  const stabilityFit = 1 - Math.abs(kata.targetStability - sample.stability);
  const guardFit = sample.guard;
  const confidenceWeight = Math.max(0.35, sample.confidence);

  return Math.round(
    clamp((motionFit * 0.35 + stabilityFit * 0.35 + guardFit * 0.3) * confidenceWeight) *
      100
  );
}

export function chooseCorrection(kata, sample) {
  const missingCorrection = kata.corrections.find((correction) => {
    if (correction.metric === "motion") {
      return sample.motion < correction.threshold || sample.motion > kata.targetMotion + 0.22;
    }

    return sample[correction.metric] < correction.threshold;
  });

  if (missingCorrection) {
    return {
      ...missingCorrection,
      isPositive: false
    };
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

export function deriveModelState(kata, sample) {
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

export function analyzeKataFrame(kata, sample) {
  const normalizedSample = createMotionSample(sample);
  const correction = chooseCorrection(kata, normalizedSample);

  return {
    sample: normalizedSample,
    correction,
    score: scoreKataPerformance(kata, normalizedSample),
    model: deriveModelState(kata, normalizedSample)
  };
}

export function estimateMotionFromFrames(previousFrame, currentFrame, options = {}) {
  if (!previousFrame || !currentFrame || previousFrame.length !== currentFrame.length) {
    return createMotionSample({ confidence: 0 });
  }

  const stride = options.stride ?? 16;
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

  const motion = clamp(total ? changed / total * 4 : 0);
  const verticalCenter = changed ? verticalEnergy / changed : 0.5;
  const stability = clamp(1 - Math.abs(verticalCenter - 0.56) * 1.6 - motion * 0.18);
  const guard = clamp(total ? upperFrameEnergy / total * 5.4 : 0.5);
  const confidence = clamp(motion * 1.4 + 0.18, 0.15, 0.96);

  return createMotionSample({ motion, stability, guard, confidence });
}
