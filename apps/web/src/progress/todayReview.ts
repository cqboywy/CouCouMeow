import type { GrowthSummary } from './extraProgressSummary';
import type { LearningItem } from './learningEvents';
import type { SchoolLaterReviewItem, SchoolProgressSummary, SchoolReviewItem } from './schoolProgressSummary';

export type TodayReviewItem =
  | { source: 'school-later'; item: SchoolLaterReviewItem }
  | { source: 'school-check'; item: SchoolReviewItem }
  | { source: 'extra'; item: LearningItem };

export function getTodayReviewItems(school: SchoolProgressSummary, extra: GrowthSummary): TodayReviewItem[] {
  return [
    ...school.laterReviewItems.map(item => ({ source: 'school-later' as const, item })),
    ...school.reviewItems.map(item => ({ source: 'school-check' as const, item })),
    ...extra.reviewItems.map(item => ({ source: 'extra' as const, item })),
  ];
}
