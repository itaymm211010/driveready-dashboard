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

/** Create a minimal StudentSkillWithCategory for testing. */
function makeSkill(
  overrides: Partial<{
    proficiency: number | null;
    categoryId: string;
    skillId: string;
    status: string;
  }> = {},
): StudentSkillWithCategory {
  const {
    proficiency = 85,
    categoryId = CAT_VEHICLE,
    skillId = crypto.randomUUID(),
    status = "in_progress",
  } = overrides;

  return {
    id: crypto.randomUUID(),
    student_id: "student-1",
    skill_id: skillId,
    current_status: status,
    last_proficiency: proficiency,
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

  it("returns 0 when all skills have proficiency 0", () => {
    const skills = [
      makeSkill({ proficiency: 0 }),
      makeSkill({ proficiency: 0 }),
    ];
    expect(calculateOverallAverage(skills)).toBe(0);
  });

  it("returns 0 when all skills have null proficiency", () => {
    const skills = [
      makeSkill({ proficiency: null }),
      makeSkill({ proficiency: null }),
    ];
    expect(calculateOverallAverage(skills)).toBe(0);
  });

  it("calculates the correct average for rated skills", () => {
    const skills = [
      makeSkill({ proficiency: 80 }),
      makeSkill({ proficiency: 60 }),
      makeSkill({ proficiency: 100 }),
    ];
    expect(calculateOverallAverage(skills)).toBe(80);
  });

  it("excludes unrated skills (proficiency 0) from the average", () => {
    const skills = [
      makeSkill({ proficiency: 90 }),
      makeSkill({ proficiency: 0 }),
      makeSkill({ proficiency: 70 }),
    ];
    // Only 90 and 70 count → avg = 80
    expect(calculateOverallAverage(skills)).toBe(80);
  });

  it("excludes null proficiency skills from the average", () => {
    const skills = [
      makeSkill({ proficiency: 100 }),
      makeSkill({ proficiency: null }),
    ];
    expect(calculateOverallAverage(skills)).toBe(100);
  });

  it("returns exact value for a single rated skill", () => {
    const skills = [makeSkill({ proficiency: 42 })];
    expect(calculateOverallAverage(skills)).toBe(42);
  });
});

// ── calculateCategoryAverage ────────────────────────────────────────────────

describe("calculateCategoryAverage", () => {
  it("returns 0 for an empty skills array", () => {
    expect(calculateCategoryAverage([], CAT_VEHICLE)).toBe(0);
  });

  it("returns 0 when no skills match the category", () => {
    const skills = [
      makeSkill({ proficiency: 90, categoryId: CAT_ROAD }),
    ];
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(0);
  });

  it("returns 0 when matching skills are all unrated", () => {
    const skills = [
      makeSkill({ proficiency: 0, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: null, categoryId: CAT_VEHICLE }),
    ];
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(0);
  });

  it("calculates average only for skills in the given category", () => {
    const skills = [
      makeSkill({ proficiency: 80, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 60, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 100, categoryId: CAT_ROAD }),
    ];
    // Only vehicle skills: (80 + 60) / 2 = 70
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(70);
  });

  it("excludes unrated skills within the category", () => {
    const skills = [
      makeSkill({ proficiency: 90, categoryId: CAT_ADVANCED }),
      makeSkill({ proficiency: 0, categoryId: CAT_ADVANCED }),
      makeSkill({ proficiency: 70, categoryId: CAT_ADVANCED }),
    ];
    // Only 90 and 70 → avg = 80
    expect(calculateCategoryAverage(skills, CAT_ADVANCED)).toBe(80);
  });

  it("handles a single rated skill in the category", () => {
    const skills = [
      makeSkill({ proficiency: 55, categoryId: CAT_VEHICLE }),
    ];
    expect(calculateCategoryAverage(skills, CAT_VEHICLE)).toBe(55);
  });
});

// ── calculateReadiness ──────────────────────────────────────────────────────

describe("calculateReadiness", () => {
  it("returns not-ready with zeroed values for empty skills", () => {
    const result = calculateReadiness([], CAT_ADVANCED);
    expect(result).toEqual({
      ready: false,
      avg: 0,
      hasLow: false,
      cat4Avg: 0,
    });
  });

  it("returns not-ready when all skills are unrated", () => {
    const skills = [
      makeSkill({ proficiency: 0 }),
      makeSkill({ proficiency: null }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(false);
    expect(result.avg).toBe(0);
  });

  it("returns ready when all conditions are met", () => {
    const skills = [
      makeSkill({ proficiency: 85, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 90, categoryId: CAT_ROAD }),
      makeSkill({ proficiency: 80, categoryId: CAT_ADVANCED }),
      makeSkill({ proficiency: 85, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(true);
    expect(result.avg).toBe(85);
    expect(result.hasLow).toBe(false);
    expect(result.cat4Avg).toBe(82.5);
  });

  it("returns not-ready when overall average is below 80", () => {
    const skills = [
      makeSkill({ proficiency: 70, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 60, categoryId: CAT_ROAD }),
      makeSkill({ proficiency: 85, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = (70+60+85)/3 ≈ 71.67
    expect(result.ready).toBe(false);
    expect(result.avg).toBeCloseTo(71.67, 1);
  });

  it("returns not-ready when any skill is below 60 (hasLow)", () => {
    const skills = [
      makeSkill({ proficiency: 90, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 50, categoryId: CAT_ROAD }),
      makeSkill({ proficiency: 95, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = (90+50+95)/3 ≈ 78.33, but hasLow = true
    expect(result.ready).toBe(false);
    expect(result.hasLow).toBe(true);
  });

  it("returns not-ready when cat4 average is below 80", () => {
    const skills = [
      makeSkill({ proficiency: 90, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 85, categoryId: CAT_ROAD }),
      makeSkill({ proficiency: 70, categoryId: CAT_ADVANCED }),
      makeSkill({ proficiency: 75, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = 80, hasLow = false, but cat4Avg = 72.5
    expect(result.ready).toBe(false);
    expect(result.cat4Avg).toBe(72.5);
  });

  it("returns not-ready when no advanced category id is provided", () => {
    // Without advancedCategoryId, cat4Avg is 0 → can never be ready
    const skills = [
      makeSkill({ proficiency: 90 }),
      makeSkill({ proficiency: 85 }),
    ];
    const result = calculateReadiness(skills);
    expect(result.ready).toBe(false);
    expect(result.cat4Avg).toBe(0);
  });

  it("correctly handles boundary value: avg exactly 80, cat4 exactly 80, no low", () => {
    const skills = [
      makeSkill({ proficiency: 80, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 80, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.ready).toBe(true);
    expect(result.avg).toBe(80);
    expect(result.cat4Avg).toBe(80);
  });

  it("correctly handles boundary: skill at exactly 60 is NOT flagged as low", () => {
    const skills = [
      makeSkill({ proficiency: 60, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 100, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    // avg = 80, hasLow = false (60 is NOT < 60), cat4 = 100
    expect(result.ready).toBe(true);
    expect(result.hasLow).toBe(false);
  });

  it("correctly handles boundary: skill at 59 IS flagged as low", () => {
    const skills = [
      makeSkill({ proficiency: 59, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 100, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.hasLow).toBe(true);
    expect(result.ready).toBe(false);
  });

  it("ignores unrated skills when checking for low scores", () => {
    // A skill with proficiency 0 should NOT be flagged as hasLow
    const skills = [
      makeSkill({ proficiency: 0, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 85, categoryId: CAT_VEHICLE }),
      makeSkill({ proficiency: 80, categoryId: CAT_ADVANCED }),
    ];
    const result = calculateReadiness(skills, CAT_ADVANCED);
    expect(result.hasLow).toBe(false);
    expect(result.avg).toBe(82.5);
  });
});
