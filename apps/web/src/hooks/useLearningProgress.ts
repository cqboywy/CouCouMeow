import { useMemo, useState } from 'react';
import { useLearningData } from '../data/LearningDataProvider';
import { deriveExtraProgress } from '../progress/extraProgressSummary';
import type { ExtraLearningEvent, LearningItem, PracticeMethod } from '../progress/learningEvents';

type Vocab = { id: string; word: string; meaning: string };
type Sentence = { id: string; english: string; chinese: string };
type Pattern = { id: string; title: string; explanation: string };
type Episode = { id: string; title: string; chinese_title?: string };

const localDay = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

export function useLearningProgress() {
  const data = useLearningData();
  const [storageError, setStorageError] = useState('');
  const extraEvents = useMemo(() => data.events.filter((event): event is ExtraLearningEvent => event.track === 'extra'), [data.events]);
  const today = localDay(new Date());
  const summary = useMemo(() => deriveExtraProgress(extraEvents, today), [extraEvents, today]);

  const persist = async (events: ExtraLearningEvent[]) => {
    try {
      await data.appendEvents(events);
      setStorageError('');
      return true;
    } catch {
      setStorageError('这次学习还没有记进线上成长记录，请检查网络后重试。');
      return false;
    }
  };
  const createEvent = (eventType: ExtraLearningEvent['eventType'], item: LearningItem, correct?: boolean, method?: PracticeMethod): ExtraLearningEvent => {
    const date = new Date();
    return {
      id: crypto.randomUUID(), userId: data.userId, track: 'extra', eventType,
      occurredAt: date.toISOString(), localDay: localDay(date), payload: { item, correct, method },
    };
  };
  const hasMastery = (item: LearningItem) => extraEvents.some(event => event.eventType === 'mastered' && event.payload.item.id === item.id);
  const recordPractice = (item: LearningItem, correct: boolean, method: PracticeMethod) => {
    const events = [createEvent('practice_completed', item, correct, method)];
    if (correct && !hasMastery(item)) events.push(createEvent('mastered', item));
    return persist(events);
  };
  const markMastered = (item: LearningItem) => {
    const events = [createEvent('practice_completed', item, true)];
    if (!hasMastery(item)) events.push(createEvent('mastered', item));
    return persist(events);
  };

  return {
    summary,
    storageError,
    recordDictation: (vocab: Vocab, episodeId: string, correct: boolean, method: Extract<PracticeMethod, 'written' | 'spoken'>) => recordPractice({ id: vocab.id, kind: 'word', english: vocab.word, chinese: vocab.meaning, episodeId }, correct, method),
    recordSentence: (sentence: Sentence, episodeId: string, correct: boolean) => recordPractice({ id: sentence.id, kind: 'sentence', english: sentence.english, chinese: sentence.chinese, episodeId }, correct, 'sentence_reading'),
    markPattern: (pattern: Pattern, episodeId: string) => markMastered({ id: pattern.id, kind: 'pattern', english: pattern.title, chinese: pattern.explanation, episodeId }),
    markEpisode: (episode: Episode) => markMastered({ id: episode.id, kind: 'episode', english: episode.title, chinese: episode.chinese_title ?? '', episodeId: episode.id }),
  };
}
