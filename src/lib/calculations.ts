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

// ── Helpers ─────────────────────────────────────────────────────────────────

const getScore = (s: StudentSkillWithCategory) => (s.current_score ?? 0) as number;

// ── Functions ───────────────────────────────────────────────────────────────

export function calculateReadiness(
  skills: StudentSkillWithCategory[],
  advancedCategoryId?: string,
): ReadinessResult {
  const rated = skills.filter((s) => getScore(s) > 0);

  if (rated.length === 0) {
    return { ready: false, avg: 0, percentage: 0, hasLow: false, cat4Avg: 0, cat4Percentage: 0 };
  }

  const avg = rated.reduce((sum, s) => sum + getScore(s), 0) / rated.length;
  const hasLow = rated.some((s) => getScore(s) < LOW_SKILL_THRESHOLD);

  const cat4Avg = advancedCategoryId
    ? calculateCategoryAverage(skills, advancedCategoryId)
    : 0;

  const ready = avg >= READY_AVG_THRESHOLD && !hasLow && cat4Avg >= CAT4_AVG_THRESHOLD;

  return {
    ready,
    avg,
    percentage: scoreToPercentage(avg as SkillScore),
    hasLow,
    cat4Avg,
    cat4Percentage: scoreToPercentage(cat4Avg as SkillScore),
  };
}

export function calculateCategoryAverage(
  skills: StudentSkillWithCategory[],
  categoryId: string,
): number {
  const categorySkills = skills.filter(
    (s) => s.skill.category_id === categoryId && getScore(s) > 0,
  );
  if (categorySkills.length === 0) return 0;
  return categorySkills.reduce((sum, s) => sum + getScore(s), 0) / categorySkills.length;
}

export function calculateOverallAverage(
  skills: StudentSkillWithCategory[],
): number {
  const rated = skills.filter((s) => getScore(s) > 0);
  if (rated.length === 0) return 0;
  return rated.reduce((sum, s) => sum + getScore(s), 0) / rated.length;
}
