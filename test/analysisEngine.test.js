import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeKataFrame,
  chooseCorrection,
  deriveModelState,
  estimateMotionFromFrames,
  scoreKataPerformance
} from "../src/analysisEngine.js";
import { getKataById } from "../src/kataLibrary.js";

test("scoreKataPerformance rewards samples near the kata reference", () => {
  const kata = getKataById("sanchin");
  const alignedScore = scoreKataPerformance(kata, {
    motion: kata.targetMotion,
    stability: kata.targetStability,
    guard: kata.model.guardHeight,
    confidence: 0.92
  });
  const poorScore = scoreKataPerformance(kata, {
    motion: 0.95,
    stability: 0.25,
    guard: 0.2,
    confidence: 0.55
  });

  assert.ok(alignedScore > poorScore);
  assert.ok(alignedScore >= 80);
});

test("chooseCorrection selects the first failed kata priority", () => {
  const kata = getKataById("seiyunchin");
  const correction = chooseCorrection(kata, {
    motion: kata.targetMotion,
    stability: 0.4,
    guard: kata.model.guardHeight,
    confidence: 0.8
  });

  assert.equal(correction.priority, "Depth");
  assert.equal(correction.isPositive, false);
});

test("analyzeKataFrame returns a positive correction when metrics match", () => {
  const kata = getKataById("gekisai-dai-ichi");
  const analysis = analyzeKataFrame(kata, {
    motion: kata.targetMotion,
    stability: kata.targetStability,
    guard: kata.model.guardHeight,
    confidence: 0.95
  });

  assert.equal(analysis.correction.isPositive, true);
  assert.ok(analysis.score >= 80);
});

test("deriveModelState clamps model values to display-safe ranges", () => {
  const kata = getKataById("saifa");
  const model = deriveModelState(kata, {
    motion: 1,
    stability: 0,
    guard: 0,
    confidence: 1
  });

  assert.ok(model.stanceWidth <= 0.82);
  assert.ok(model.guardHeight >= 0.44);
  assert.ok(model.forwardPressure <= 0.9);
});

test("estimateMotionFromFrames converts pixel deltas into motion samples", () => {
  const previousFrame = new Uint8ClampedArray(4 * 4 * 4).fill(10);
  const currentFrame = new Uint8ClampedArray(4 * 4 * 4).fill(80);
  const sample = estimateMotionFromFrames(previousFrame, currentFrame, {
    width: 4,
    height: 4,
    stride: 1
  });

  assert.ok(sample.motion > 0);
  assert.ok(sample.confidence > 0.15);
  assert.ok(sample.stability >= 0 && sample.stability <= 1);
});
