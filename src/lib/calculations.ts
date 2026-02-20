/**
 * Student readiness and skill average calculation functions.
 *
 * Uses 0-5 scoring scale with conversion to percentages for display.
 *
 * Readiness formula: coverage × quality
 *   coverage = rated_skills / total_skills
 *   quality  = avg_rated_score / 5
 *   readiness% = round(coverage × quality × 100)
 *
 * Ready conditions:
 *   readiness% >= 80
 *   coverage   >= 90%
 *   no skill   <  3
 *   cat4 avg   >= 4
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
  /** Average score of rated skills (0-5 scale). */
  avg: number;
  /** Combined readiness percentage: coverage × quality (0-100). */
  percentage: number;
  /** Coverage: percentage of total skills that have been rated (0-100). */
  coverage: number;
  /** True if any rated skill is below the minimum threshold (< 3). */
  hasLow: boolean;
  /** Average score for the advanced category (category 4 / "מצבים מתקדמים"). */
  cat4Avg: number;
  /** Category 4 average as percentage (0-100 for display). */
  cat4Percentage: number;
}

// ── Constants ───────────────────────────────────────────────────────────────

/** Minimum combined readiness percentage to be considered ready. */
const READY_THRESHOLD = 80;

/** Minimum fraction of skills that must be rated (0-1). */
const COVERAGE_THRESHOLD = 0.9;

/** Score below this value flags a skill as "low" (< 3). */
const LOW_SKILL_THRESHOLD = 3;

/** Minimum category-4 average score to be considered ready (4/5). */
const CAT4_AVG_THRESHOLD = 4;

// ── Helpers ─────────────────────────────────────────────────────────────────

const getScore = (s: StudentSkillWithCategory) => (s.current_score ?? 0) as number;

const ZERO_RESULT: ReadinessResult = {
  ready: false, avg: 0, percentage: 0, coverage: 0,
  hasLow: false, cat4Avg: 0, cat4Percentage: 0,
};

// ── Functions ────────────────────────────────────────────────────────────────

export function calculateReadiness(
  skills: StudentSkillWithCategory[],
  advancedCategoryId?: string,
): ReadinessResult {
  if (skills.length === 0) return ZERO_RESULT;

  const rated = skills.filter((s) => getScore(s) > 0);
  if (rated.length === 0) return ZERO_RESULT;

  // Quality: average of rated skills (0-5)
  const avg = rated.reduce((sum, s) => sum + getScore(s), 0) / rated.length;

  // Coverage: fraction of total skills rated
  const coverageRatio = rated.length / skills.length;
  const coverage = Math.round(coverageRatio * 100);

  // Combined readiness
  const percentage = Math.round(coverageRatio * (avg / 5) * 100);

  const hasLow = rated.some((s) => getScore(s) < LOW_SKILL_THRESHOLD);

  const cat4Avg = advancedCategoryId
    ? calculateCategoryAverage(skills, advancedCategoryId)
    : 0;

  const ready =
    percentage >= READY_THRESHOLD &&
    coverageRatio >= COVERAGE_THRESHOLD &&
    !hasLow &&
    cat4Avg >= CAT4_AVG_THRESHOLD;

  return {
    ready,
    avg,
    percentage,
    coverage,
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
