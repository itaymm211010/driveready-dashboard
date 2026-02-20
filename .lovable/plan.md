
# Fix Build Errors in StudentProfile.tsx

## Problem
The fallback object on line 204 is missing `totalCount` and `coverage` properties that the template uses on lines 410, 453, 463, and 465.

## Fix
Update the fallback object on line 204 to include the missing properties:

```typescript
// Change from:
{ ready: false, overallAvg: 0, hasLowSkills: false, lowSkillCount: 0, advancedCatAvg: 0, ratedCount: 0 }

// To:
{ ready: false, overallAvg: 0, coverage: 0, hasLowSkills: false, lowSkillCount: 0, advancedCatAvg: 0, ratedCount: 0, totalCount: 0 }
```

## Migration
Also run the readiness formula migration SQL (`supabase/migrations/20260221_update_readiness_formula.sql`) which:
- Replaces the existing readiness trigger with coverage x quality formula
- Recalculates all existing students' readiness percentages
