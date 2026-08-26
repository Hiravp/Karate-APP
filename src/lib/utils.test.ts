import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateClassCode, cn } from "./utils";

describe("generateClassCode", () => {
  it("returns a 6-character alphanumeric code by default", () => {
    const code = generateClassCode();
    assert.equal(code.length, 6);
    assert.match(code, /^[A-Z0-9]+$/);
  });

  it("respects custom length", () => {
    assert.equal(generateClassCode(8).length, 8);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    assert.equal(cn("px-2", "px-4"), "px-4");
  });
});
