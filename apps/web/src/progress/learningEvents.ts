import type { SchoolLearningItem } from '../curriculum/types';

export type LearningTrack = 'extra' | 'school';
export type LearningEventType =
  | 'practice_completed'
  | 'mastered'
  | 'exercise'
  | 'lesson_completed'
  | 'page_completed'
  | 'page_check'
  | 'later_review_added'
  | 'later_review_resolved';

export type MasteryKind = 'word' | 'sentence' | 'pattern' | 'episode';
export type PracticeMethod = 'written' | 'spoken' | 'sentence_reading';

export type LearningItem = {
  id: string;
  kind: MasteryKind;
  english: string;
  chinese: string;
  episodeId: string;
};

export type LearningEventEnvelope<T extends LearningTrack, P, E extends LearningEventType = LearningEventType> = {
  id: string;
  userId: string;
  track: T;
  eventType: E;
  occurredAt: string;
  localDay: string;
  payload: P;
};

export type ExtraEventPayload = {
  item: LearningItem;
  correct?: boolean;
  method?: PracticeMethod;
};

export type ExtraLearningEvent = LearningEventEnvelope<
  'extra',
  ExtraEventPayload,
  'practice_completed' | 'mastered'
>;

export type SchoolEventPayload = {
  textbookId: string;
  unitId: string;
  lessonId: string;
  pageId?: string;
  exerciseId?: string;
  correct?: boolean;
  item?: SchoolLearningItem;
  masteredItems?: SchoolLearningItem[];
};

export type SchoolLearningEvent = LearningEventEnvelope<
  'school',
  SchoolEventPayload,
  'exercise' | 'lesson_completed' | 'page_completed' | 'page_check' | 'later_review_added' | 'later_review_resolved'
>;

export type LearningEvent = ExtraLearningEvent | SchoolLearningEvent;
