import { describe, it, expect } from "vitest";
import {
  calculateReadiness,
  calculateCategoryAverage,
  calculateOverallAverage,
  type StudentSkillWithCategory,
} from "./calculations";

// ── Helpers ─────────────────────────────────────────────────────────────────

const CAT_ADVANCED = "cat-4-advanced";
const CAT_VEHICLE = "cat-1-vehicle";
const CAT_ROAD = "cat-2-road";

/** Create a minimal StudentSkillWithCategory for testing (0-5 scoring). */
function makeSkill(
  overrides: Partial<{
    score: number | null;
    categoryId: string;
    skillId: string;
  }> = {},
): StudentSkillWithCategory {
  const {
    score = 4,
    categoryId = CAT_VEHICLE,
    skillId = crypto.randomUUID(),
  } = overrides;

  return {
    id: crypto.randomUUID(),
    student_id: "student-1",
    skill_id: skillId,
    current_score: score,
    last_note: null,
    last_practiced_date: null,
    times_practiced: 1,
    updated_at: new Date().toISOString(),
    skill: {
      id: skillId,
      category_id: categoryId,
      name: "Test Skill",
    },
  };
}

// ── calculateOverallAverage ─────────────────────────────────────────────────

describe("calculateOverallAverage", () => {
  it("returns 0 for an empty skills array", () => {
    expect(calculateOverallAverage([])).toBe(0);
  });

  it("returns 0 when all skills have score 0", () => {
    const skills = [
      makeSkill({ score: 0 }),
      makeSkill({ score: 0 }),
    ];
    expect(calculateOverallAverage(skills)).toBe(0);
  });

  it("returns 0 when all skills have null score", () => {
    const skills = [
      makeSkill({ score: null }),
      makeSkill({ score: null }),
    ];
    expect(calculateOverallAverage(skills)).toBe(0);
  });

  it("calculates the correct average for rated skills", () => {
    const skills = [
      makeSkill({ score: 4 }), // 80%
      makeSkill({ score: 3 }), // 60%
      makeSkill({ score: 5 }), // 100%
    ];
    // (4 + 3 + 5) / 3 = 4
    expect(calculateOverallAverage(skills)).toBe(4);
  });

  it("excludes unrated skills (score 0) from the average", () => {
    const skills = [
      makeSkill({ score: 5 }), // 90%
      makeSkill({ score: 0 }), // unrated
      makeSkill({ score: 3 }), // 70%
    ];
    // Only 5 and 3 count → avg = 4
    expect(calculateOverallAverage(skills)).toBe(4);
  });

  it("excludes null score skills from the average", () => {
    const skills = [
      makeSkill({ score: 5 }),
      makeSkill({ score: null }),
    ];
    expect(calculateOverallAverage(skills)).toBe(5);
  });

  it("returns exact value for a single rated skill", () => {
    const skills = [makeSkill({ score: 2 })];
    expect(calculateOverallAverage(skills)).toBe(2);
  });
});

// ── calculateCategoryAverage ────────────────────────────────────────────────

describe("calculateCategoryAverage", () => {
  it("returns 0 for an empty skills array", () => {
    expect(calculateCategoryAverage([], CAT_VEHICLE)).toBe(0);
  });

  it("returns 0 when no skills match the category", () => {
    const skills = [
      makeSkill({ score: 5, categoryId: CAT_ROAD }),
    ];
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(0);
  });

  it("returns 0 when matching skills are all unrated", () => {
    const skills = [
      makeSkill({ score: 0, categoryId: CAT_VEHICLE }),
      makeSkill({ score: null, categoryId: CAT_VEHICLE }),
    ];
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(0);
  });

  it("calculates average only for skills in the given category", () => {
    const skills = [
      makeSkill({ score: 4, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 3, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_ROAD }),
    ];
    // Only vehicle skills: (4 + 3) / 2 = 3.5
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(3.5);
  });

  it("excludes unrated skills within the category", () => {
    const skills = [
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 0, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 3, categoryId: CAT_ADVANCED }),
    ];
    // Only 5 and 3 → avg = 4
    expect(calculateCategoryAverage(skills, CAT_ADVANCED)).toBe(4);
  });

  it("handles a single rated skill in the category", () => {
    const skills = [
      makeSkill({ score: 3, categoryId: CAT_VEHICLE }),
    ];
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(3);
  });
});

// ── calculateReadiness ──────────────────────────────────────────────────────

describe("calculateReadiness", () => {
  it("returns not-ready with zeroed values for empty skills", () => {
    const result = calculateReadiness([], CAT_ADVANCED);
    expect(result).toEqual({
      ready: false,
      avg: 0,
      percentage: 0,
      hasLow: false,
      cat4Avg: 0,
      cat4Percentage: 0,
    });
  });

  it("returns not-ready when all skills are unrated", () => {
    const skills = [
      makeSkill({ score: 0 }),
      makeSkill({ score: null }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(false);
    expect(result.avg).toBe(0);
  });

  it("returns ready when all conditions are met", () => {
    const skills = [
      makeSkill({ score: 4, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_ROAD }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(true);
    expect(result.avg).toBeCloseTo(4.25, 2);
    expect(result.hasLow).toBe(false);
    expect(result.cat4Avg).toBe(4);
  });

  it("returns not-ready when overall average is below 4", () => {
    const skills = [
      makeSkill({ score: 3, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 3, categoryId: CAT_ROAD }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = (3+3+4)/3 ≈ 3.33
    expect(result.ready).toBe(false);
    expect(result.avg).toBeCloseTo(3.33, 1);
  });

  it("returns not-ready when any skill is below 3 (hasLow)", () => {
    const skills = [
      makeSkill({ score: 5, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 2, categoryId: CAT_ROAD }),
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = (5+2+5)/3 = 4, but hasLow = true
    expect(result.ready).toBe(false);
    expect(result.hasLow).toBe(true);
  });

  it("returns not-ready when cat4 average is below 4", () => {
    const skills = [
      makeSkill({ score: 5, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 4, categoryId: CAT_ROAD }),
      makeSkill({ score: 3, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = 4, hasLow = false, but cat4Avg = 3.5
    expect(result.ready).toBe(false);
    expect(result.cat4Avg).toBe(3.5);
  });

  it("returns not-ready when no advanced category id is provided", () => {
    // Without advancedCategoryId, cat4Avg is 0 → can never be ready
    const skills = [
      makeSkill({ score: 5 }),
      makeSkill({ score: 4 }),
    ];
    const result = calculateReadiness(skills);
    expect(result.ready).toBe(false);
    expect(result.cat4Avg).toBe(0);
  });

  it("correctly handles boundary value: avg exactly 4, cat4 exactly 4, no low", () => {
    const skills = [
      makeSkill({ score: 4, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(true);
    expect(result.avg).toBe(4);
    expect(result.cat4Avg).toBe(4);
  });

  it("correctly handles boundary: skill at exactly 3 is NOT flagged as low", () => {
    const skills = [
      makeSkill({ score: 3, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = 4, hasLow = false (3 is NOT < 3), cat4 = 5
    expect(result.ready).toBe(true);
    expect(result.hasLow).toBe(false);
  });

  it("correctly handles boundary: skill at 2 IS flagged as low", () => {
    const skills = [
      makeSkill({ score: 2, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.hasLow).toBe(true);
    expect(result.ready).toBe(false);
  });

  it("ignores unrated skills when checking for low scores", () => {
    // A skill with score 0 should NOT be flagged as hasLow
    const skills = [
      makeSkill({ score: 0, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 4, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.hasLow).toBe(false);
    expect(result.avg).toBe(4);
  });
});
