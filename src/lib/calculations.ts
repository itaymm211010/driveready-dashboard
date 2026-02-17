/**
 * Student readiness and skill average calculation functions.
 *
 * Adapted from the drivetrack-v4.jsx spec formula (0-5 scale)
 * to the current system's proficiency percentage (0-100 scale).
 *
 * Scale mapping:
 *   Spec avg >= 4  -->  avg >= 80
 *   Spec skill < 3 -->  skill < 60
 */

import type { Tables } from "@/integrations/supabase/types";

// ── Types ───────────────────────────────────────────────────────────────────

type StudentSkillRow = Tables<"student_skills">;

/** A student skill joined with its parent skill (including category_id). */
export interface StudentSkillWithCategory extends StudentSkillRow {
  skill: {
    id: string;
    category_id: string;
    name: string;
  };
}

export interface ReadinessResult {
  /** Whether the student is considered test-ready. */
  ready: boolean;
  /** Overall average proficiency (0-100). */
  avg: number;
  /** True if any rated skill is below the minimum threshold (60). */
  hasLow: boolean;
  /** Average proficiency for the advanced category (category 4 / "מצבים מתקדמים"). */
  cat4Avg: number;
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Minimum overall average to be considered ready (spec: 4/5 = 80%). */
const READY_AVG_THRESHOLD = 80;

/** Proficiency below this value flags a skill as "low" (spec: 3/5 = 60%). */
const LOW_SKILL_THRESHOLD = 60;

/** Minimum category-4 average to be considered ready (spec: 4/5 = 80%). */
const CAT4_AVG_THRESHOLD = 80;

// ── Functions ───────────────────────────────────────────────────────────────

/**
 * Calculate test-readiness for a student based on their skill proficiencies.
 *
 * A student is "ready" when all three conditions are met:
 * 1. Overall average proficiency >= 80
 * 2. No individual rated skill has proficiency < 60
 * 3. Category-4 ("מצבים מתקדמים") average >= 80
 *
 * @param skills - The student's skills with joined category info.
 * @param advancedCategoryId - UUID of the advanced situations category.
 *   When omitted the function still computes avg / hasLow but cat4Avg will be 0.
 * @returns A {@link ReadinessResult} object.
 */
export function calculateReadiness(
  skills: StudentSkillWithCategory[],
  advancedCategoryId?: string,
): ReadinessResult {
  const rated = skills.filter(
    (s) => s.last_proficiency != null && s.last_proficiency > 0,
  );

  if (rated.length === 0) {
    return { ready: false, avg: 0, hasLow: false, cat4Avg: 0 };
  }

  const avg =
    rated.reduce((sum, s) => sum + (s.last_proficiency as number), 0) /
    rated.length;

  const hasLow = rated.some(
    (s) => (s.last_proficiency as number) < LOW_SKILL_THRESHOLD,
  );

  const cat4Avg = advancedCategoryId
    ? calculateCategoryAverage(skills, advancedCategoryId)
    : 0;

  const ready =
    avg >= READY_AVG_THRESHOLD && !hasLow && cat4Avg >= CAT4_AVG_THRESHOLD;

  return { ready, avg, hasLow, cat4Avg };
}

/**
 * Calculate the average proficiency for skills in a specific category.
 *
 * Only skills with `last_proficiency > 0` (i.e. rated at least once) are
 * included. Returns 0 when there are no rated skills in the category.
 *
 * @param skills - The student's skills with joined category info.
 * @param categoryId - The UUID of the category to filter by.
 * @returns Average proficiency (0-100) or 0.
 */
export function calculateCategoryAverage(
  skills: StudentSkillWithCategory[],
  categoryId: string,
): number {
  const categorySkills = skills.filter(
    (s) =>
      s.skill.category_id === categoryId &&
      s.last_proficiency != null &&
      s.last_proficiency > 0,
  );

  if (categorySkills.length === 0) return 0;

  return (
    categorySkills.reduce(
      (sum, s) => sum + (s.last_proficiency as number),
      0,
    ) / categorySkills.length
  );
}

/**
 * Calculate the overall average proficiency across all rated skills.
 *
 * Only skills with `last_proficiency > 0` are included.
 * Returns 0 when there are no rated skills.
 *
 * @param skills - The student's skills with joined category info.
 * @returns Average proficiency (0-100) or 0.
 */
export function calculateOverallAverage(
  skills: StudentSkillWithCategory[],
): number {
  const rated = skills.filter(
    (s) => s.last_proficiency != null && s.last_proficiency > 0,
  );

  if (rated.length === 0) return 0;

  return (
    rated.reduce((sum, s) => sum + (s.last_proficiency as number), 0) /
    rated.length
  );
}
