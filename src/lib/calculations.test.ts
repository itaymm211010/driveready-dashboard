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
    current_score: score ?? 0,
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
    const skills = [makeSkill({ score: 0 }), makeSkill({ score: 0 })];
    expect(calculateOverallAverage(skills)).toBe(0);
  });

  it("returns 0 when all skills have null score", () => {
    const skills = [makeSkill({ score: null }), makeSkill({ score: null })];
    expect(calculateOverallAverage(skills)).toBe(0);
  });

  it("calculates the correct average for rated skills", () => {
    const skills = [
      makeSkill({ score: 4 }),
      makeSkill({ score: 3 }),
      makeSkill({ score: 5 }),
    ];
    expect(calculateOverallAverage(skills)).toBe(4);
  });

  it("excludes unrated skills (score 0) from the average", () => {
    const skills = [
      makeSkill({ score: 5 }),
      makeSkill({ score: 0 }),
      makeSkill({ score: 3 }),
    ];
    expect(calculateOverallAverage(skills)).toBe(4);
  });

  it("excludes null score skills from the average", () => {
    const skills = [makeSkill({ score: 5 }), makeSkill({ score: null })];
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
    const skills = [makeSkill({ score: 5, categoryId: CAT_ROAD })];
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
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(3.5);
  });

  it("excludes unrated skills within the category", () => {
    const skills = [
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 0, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 3, categoryId: CAT_ADVANCED }),
    ];
    expect(calculateCategoryAverage(skills, CAT_ADVANCED)).toBe(4);
  });

  it("handles a single rated skill in the category", () => {
    const skills = [makeSkill({ score: 3, categoryId: CAT_VEHICLE })];
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(3);
  });
});

// ── calculateReadiness ──────────────────────────────────────────────────────

describe("calculateReadiness", () => {
  it("returns not-ready with zeroed values for empty skills", () => {
    const result = calculateReadiness([], CAT_ADVANCED);
    expect(result).toEqual({
      ready: false, avg: 0, percentage: 0, coverage: 0,
      hasLow: false, cat4Avg: 0, cat4Percentage: 0,
    });
  });

  it("returns not-ready when all skills are unrated", () => {
    const skills = [makeSkill({ score: 0 }), makeSkill({ score: null })];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(false);
    expect(result.avg).toBe(0);
    expect(result.coverage).toBe(0);
  });

  it("returns ready when all conditions are met (full coverage)", () => {
    const skills = [
      makeSkill({ score: 4, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_ROAD }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(true);
    expect(result.avg).toBeCloseTo(4.25, 2);
    expect(result.coverage).toBe(100);
    expect(result.hasLow).toBe(false);
    expect(result.cat4Avg).toBe(4);
  });

  it("returns not-ready when coverage is below 90%", () => {
    // 5 rated out of 10 total = 50% coverage
    const skills = [
      makeSkill({ score: 5, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
      makeSkill({ score: 5, categoryId: CAT_ROAD }),
      makeSkill({ score: 0, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 0, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 0, categoryId: CAT_ROAD }),
      makeSkill({ score: 0, categoryId: CAT_ROAD }),
      makeSkill({ score: 0, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(false);
    expect(result.coverage).toBe(50);
  });

  it("percentage reflects coverage × quality (not quality alone)", () => {
    // 5/31-like scenario: 5 rated out of 31, all score 4
    const rated = Array.from({ length: 5 }, () => makeSkill({ score: 4, categoryId: CAT_VEHICLE }));
    const unrated = Array.from({ length: 26 }, () => makeSkill({ score: 0, categoryId: CAT_ROAD }));
    const result = calculateReadiness([...rated, ...unrated], CAT_ADVANCED);
    // coverage = 5/31 ≈ 16%, quality = 4/5 = 80%, readiness ≈ 13%
    expect(result.percentage).toBeLessThan(20);
    expect(result.ready).toBe(false);
  });

  it("returns not-ready when overall average is below threshold", () => {
    const skills = [
      makeSkill({ score: 3, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 3, categoryId: CAT_ROAD }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
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
    expect(result.ready).toBe(false);
    expect(result.cat4Avg).toBe(3.5);
  });

  it("returns not-ready when no advanced category id is provided", () => {
    const skills = [makeSkill({ score: 5 }), makeSkill({ score: 4 })];
    const result = calculateReadiness(skills);
    expect(result.ready).toBe(false);
    expect(result.cat4Avg).toBe(0);
  });

  it("correctly handles boundary value: all conditions met at exactly threshold", () => {
    const skills = [
      makeSkill({ score: 4, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // coverage=100%, quality=80%, percentage=80 — exactly at threshold
    expect(result.ready).toBe(true);
    expect(result.percentage).toBe(80);
    expect(result.coverage).toBe(100);
    expect(result.avg).toBe(4);
    expect(result.cat4Avg).toBe(4);
  });

  it("correctly handles boundary: skill at exactly 3 is NOT flagged as low", () => {
    const skills = [
      makeSkill({ score: 3, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 5, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
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
    const skills = [
      makeSkill({ score: 0, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 4, categoryId: CAT_VEHICLE }),
      makeSkill({ score: 4, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.hasLow).toBe(false);
    expect(result.avg).toBe(4);
    expect(result.coverage).toBe(67); // 2/3
  });
});
