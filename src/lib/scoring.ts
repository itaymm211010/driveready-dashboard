/**
 * Scoring System Utilities
 *
 * Implements 0-5 skill scoring with conversion to percentages for display.
 * Based on agent recommendations and UX research.
 */

// ============================================================================
// TYPES
// ============================================================================

export type SkillScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface ScoreLevel {
  score: SkillScore;
  label: string;
  labelEn: string;
  color: string;
  bgColor: string;
  description: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Score level definitions with labels, colors, and descriptions
 */
export const SCORE_LEVELS: Record<SkillScore, ScoreLevel> = {
  0: {
    score: 0,
    label: "לא דורג",
    labelEn: "Not Rated",
    color: "#6B7280",      // gray-500
    bgColor: "#F3F4F6",    // gray-100
    description: "המיומנות טרם הוערכה",
  },
  1: {
    score: 1,
    label: "לא שולט",
    labelEn: "No Control",
    color: "#EF4444",      // red-500
    bgColor: "#FEE2E2",    // red-100
    description: "קשיים משמעותיים, דרוש תרגול רב",
  },
  2: {
    score: 2,
    label: "שולט חלקית",
    labelEn: "Partial Control",
    color: "#F97316",      // orange-500
    bgColor: "#FFEDD5",    // orange-100
    description: "שליטה חלקית, דרוש המשך תרגול",
  },
  3: {
    score: 3,
    label: "ברוב המקרים",
    labelEn: "Most of the Time",
    color: "#EAB308",      // yellow-500
    bgColor: "#FEF9C3",    // yellow-100
    description: "ביצוע סביר ברוב המצבים",
  },
  4: {
    score: 4,
    label: "טוב ויציב",
    labelEn: "Good & Stable",
    color: "#22C55E",      // green-500
    bgColor: "#DCFCE7",    // green-100
    description: "ביצוע טוב ועקבי",
  },
  5: {
    score: 5,
    label: "מוכן לטסט",
    labelEn: "Test Ready",
    color: "#38BDF8",      // sky-500
    bgColor: "#E0F2FE",    // sky-100
    description: "שליטה מלאה, מוכן למבחן",
  },
} as const;

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert score (0-5) to percentage (0-100)
 * @param score - Skill score 0-5
 * @returns Percentage 0-100
 */
export function scoreToPercentage(score: SkillScore): number {
  return (score / 5) * 100;
}

/**
 * Convert percentage (0-100) to nearest score (0-5)
 * Rounds to nearest valid score.
 * @param percentage - Percentage 0-100
 * @returns Skill score 0-5
 */
export function percentageToScore(percentage: number): SkillScore {
  const score = Math.round((percentage / 100) * 5);
  return Math.max(0, Math.min(5, score)) as SkillScore;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get score level details
 * @param score - Skill score 0-5
 * @returns Score level configuration
 */
export function getScoreLevel(score: SkillScore): ScoreLevel {
  return SCORE_LEVELS[score];
}

/**
 * Get all score levels as array (for rendering options)
 * @returns Array of score levels 0-5
 */
export function getAllScoreLevels(): ScoreLevel[] {
  return Object.values(SCORE_LEVELS);
}

/**
 * Validate if value is a valid score
 * @param value - Value to validate
 * @returns True if valid score (0-5)
 */
export function isValidScore(value: unknown): value is SkillScore {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 5
  );
}

/**
 * Format score for display with label and percentage
 * @param score - Skill score 0-5
 * @param includePercentage - Whether to include percentage
 * @returns Formatted string (e.g., "טוב ויציב (80%)")
 */
export function formatScore(score: SkillScore, includePercentage = false): string {
  const level = getScoreLevel(score);
  if (includePercentage) {
    const percentage = scoreToPercentage(score);
    return `${level.label} (${percentage}%)`;
  }
  return level.label;
}

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

/**
 * Calculate average score from array of scores
 * Excludes score 0 (not rated) from calculation
 * @param scores - Array of skill scores
 * @returns Average score (0-5 scale) or 0 if no rated skills
 */
export function calculateAverageScore(scores: SkillScore[]): number {
  const ratedScores = scores.filter(s => s > 0);
  if (ratedScores.length === 0) return 0;

  const sum = ratedScores.reduce((acc, score) => acc + score, 0);
  return sum / ratedScores.length;
}

/**
 * Calculate average percentage from array of scores
 * Excludes score 0 (not rated) from calculation
 * @param scores - Array of skill scores
 * @returns Average percentage (0-100 scale) or 0 if no rated skills
 */
export function calculateAveragePercentage(scores: SkillScore[]): number {
  const avgScore = calculateAverageScore(scores);
  return scoreToPercentage(avgScore as SkillScore);
}

/**
 * Check if score is below threshold
 * @param score - Skill score to check
 * @param threshold - Minimum acceptable score (default 3)
 * @returns True if score is below threshold (and not 0/unrated)
 */
export function isBelowThreshold(score: SkillScore, threshold: SkillScore = 3): boolean {
  return score > 0 && score < threshold;
}

/**
 * Get color for score (for charts, badges, etc.)
 * @param score - Skill score 0-5
 * @returns Hex color code
 */
export function getScoreColor(score: SkillScore): string {
  return getScoreLevel(score).color;
}

/**
 * Get background color for score
 * @param score - Skill score 0-5
 * @returns Hex background color code
 */
export function getScoreBgColor(score: SkillScore): string {
  return getScoreLevel(score).bgColor;
}
