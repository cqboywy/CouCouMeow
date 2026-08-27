import { useRef, useState } from 'react';
import { createLocalProgressRepository, type GrowthSummary, type PracticeMethod } from '../progress/localProgressRepository';

type Vocab = { id: string; word: string; meaning: string };
type Sentence = { id: string; english: string; chinese: string };
type Pattern = { id: string; title: string; explanation: string };
type Episode = { id: string; title: string; chinese_title?: string };
type Options = { storage?: Storage };

export function useLearningProgress({ storage = window.localStorage }: Options = {}) {
  const repository = useRef(createLocalProgressRepository(storage, () => new Date()));
  const [summary, setSummary] = useState<GrowthSummary>(() => repository.current.getSummary());
  const [storageError, setStorageError] = useState('');
  const update = (action: () => void) => {
    try {
      action();
      setSummary(repository.current.getSummary());
      setStorageError('');
    } catch {
      setStorageError('这次学习还没有记进成长记录，请检查浏览器存储空间后再试。');
    }
  };
  return {
    summary,
    storageError,
    recordDictation: (vocab: Vocab, episodeId: string, correct: boolean, method: Extract<PracticeMethod, 'written' | 'spoken'>) => update(() => repository.current.recordPractice({ id: vocab.id, kind: 'word', english: vocab.word, chinese: vocab.meaning, episodeId }, correct, method)),
    recordSentence: (sentence: Sentence, episodeId: string, correct: boolean) => update(() => repository.current.recordPractice({ id: sentence.id, kind: 'sentence', english: sentence.english, chinese: sentence.chinese, episodeId }, correct, 'sentence_reading')),
    markPattern: (pattern: Pattern, episodeId: string) => update(() => repository.current.markMastered({ id: pattern.id, kind: 'pattern', english: pattern.title, chinese: pattern.explanation, episodeId })),
    markEpisode: (episode: Episode) => update(() => repository.current.markMastered({ id: episode.id, kind: 'episode', english: episode.title, chinese: episode.chinese_title ?? '', episodeId: episode.id })),
  };
}
