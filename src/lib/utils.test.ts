import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateClassCode, cn } from "./utils";
import * as storeApi from "./demo-store";
import type { DemoStore } from "./types";

function blank(): DemoStore {
  return {
    users: [],
    classes: [],
    enrollments: [],
    assignments: [],
    submissions: [],
    sessionUserId: null,
  };
}

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

describe("demo store join flow", () => {
  it("lets a student join a teacher class by code", () => {
    let s = blank();
    const teacher = storeApi.signUp(s, {
      full_name: "Ms Patel",
      email: "patel@school.test",
      role: "teacher",
    });
    s = teacher.store;
    const created = storeApi.createClass(s, teacher.user.id, "Geometry Honors");
    s = created.store;
    const student = storeApi.signUp(s, {
      full_name: "Sam Kim",
      email: "sam@school.test",
      role: "student",
    });
    s = student.store;
    const joined = storeApi.joinClass(
      s,
      student.user.id,
      ` ${created.classRecord.class_code.toLowerCase()} `
    );
    assert.equal(joined.error, undefined);
    assert.equal(joined.classRecord?.id, created.classRecord.id);
    assert.equal(joined.store.enrollments.length, 1);
  });

  it("rejects invalid code length", () => {
    const result = storeApi.joinClass(blank(), "stu", "AB");
    assert.match(result.error ?? "", /6-character/);
  });
});
