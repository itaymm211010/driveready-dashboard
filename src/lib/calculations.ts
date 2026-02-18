/**
 * Student readiness and skill average calculation functions.
 *
 * Uses 0-5 scoring scale with conversion to percentages for display.
 *
 * Score thresholds:
 *   Ready avg >= 4 (80%)
 *   Low skill < 3 (60%)
 *   Category 4 avg >= 4 (80%)
 */

import type { Tables } from "@/integrations/supabase/types";
import { scoreToPercentage, type SkillScore } from "./scoring";

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
  /** Overall average score (0-5 scale). */
  avg: number;
  /** Overall average as percentage (0-100 for display). */
  percentage: number;
  /** True if any rated skill is below the minimum threshold (< 3). */
  hasLow: boolean;
  /** Average score for the advanced category (category 4 / "מצבים מתקדמים"). */
  cat4Avg: number;
  /** Category 4 average as percentage (0-100 for display). */
  cat4Percentage: number;
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Minimum overall average score to be considered ready (4/5). */
const READY_AVG_THRESHOLD = 4;

/** Score below this value flags a skill as "low" (< 3). */
const LOW_SKILL_THRESHOLD = 3;

/** Minimum category-4 average score to be considered ready (4/5). */
const CAT4_AVG_THRESHOLD = 4;

// ── Functions ───────────────────────────────────────────────────────────────

/**
 * Calculate test-readiness for a student based on their skill scores.
 *
 * A student is "ready" when all three conditions are met:
 * 1. Overall average score >= 4 (80%)
 * 2. No individual rated skill has score < 3 (60%)
 * 3. Category-4 ("מצבים מתקדמים") average >= 4 (80%)
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
    (s) => s.current_score != null && s.current_score > 0,
  );

  if (rated.length === 0) {
    return {
      ready: false,
      avg: 0,
      percentage: 0,
      hasLow: false,
      cat4Avg: 0,
      cat4Percentage: 0,
    };
  }

  const avg =
    rated.reduce((sum, s) => sum + (s.current_score as number), 0) /
    rated.length;

  const hasLow = rated.some(
    (s) => (s.current_score as number) < LOW_SKILL_THRESHOLD,
  );

  const cat4Avg = advancedCategoryId
    ? calculateCategoryAverage(skills, advancedCategoryId)
    : 0;

  const ready =
    avg >= READY_AVG_THRESHOLD && !hasLow && cat4Avg >= CAT4_AVG_THRESHOLD;

  return {
    ready,
    avg,
    percentage: scoreToPercentage(avg as SkillScore),
    hasLow,
    cat4Avg,
    cat4Percentage: scoreToPercentage(cat4Avg as SkillScore),
  };
}

/**
 * Calculate the average score for skills in a specific category.
 *
 * Only skills with `current_score > 0` (i.e. rated at least once) are
 * included. Returns 0 when there are no rated skills in the category.
 *
 * @param skills - The student's skills with joined category info.
 * @param categoryId - The UUID of the category to filter by.
 * @returns Average score (0-5 scale) or 0.
 */
export function calculateCategoryAverage(
  skills: StudentSkillWithCategory[],
  categoryId: string,
): number {
  const categorySkills = skills.filter(
    (s) =>
      s.skill.category_id === categoryId &&
      s.current_score != null &&
      s.current_score > 0,
  );

  if (categorySkills.length === 0) return 0;

  return (
    categorySkills.reduce(
      (sum, s) => sum + (s.current_score as number),
      0,
    ) / categorySkills.length
  );
}

/**
 * Calculate the overall average score across all rated skills.
 *
 * Only skills with `current_score > 0` are included.
 * Returns 0 when there are no rated skills.
 *
 * @param skills - The student's skills with joined category info.
 * @returns Average score (0-5 scale) or 0.
 */
export function calculateOverallAverage(
  skills: StudentSkillWithCategory[],
): number {
  const rated = skills.filter(
    (s) => s.current_score != null && s.current_score > 0,
  );

  if (rated.length === 0) return 0;

  return (
    rated.reduce((sum, s) => sum + (s.current_score as number), 0) /
    rated.length
  );
}
