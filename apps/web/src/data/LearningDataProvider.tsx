import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { LearningEvent } from '../progress/learningEvents';
import { importLegacyProgress } from './legacyProgressImport';
import type { LearningProgressRepository } from './learningProgressRepository';
import { ensureAuthenticatedUser } from './supabaseAuth';
import { createSupabaseBrowserClient, readSupabaseConfig } from './supabaseConfig';
import { createSupabaseGateway } from './supabaseGateway';
import { createSupabaseLearningProgressRepository } from './supabaseLearningProgressRepository';

export type InitializedLearningData = {
  userId: string;
  repository: LearningProgressRepository;
  events: LearningEvent[];
  selectedTextbookId: string;
};

type LearningDataValue = InitializedLearningData & {
  appendEvents(events: LearningEvent[]): Promise<void>;
  selectTextbook(textbookId: string): Promise<void>;
};

const LearningDataContext = createContext<LearningDataValue | null>(null);

export async function initializeLearningData(defaultTextbookId: string): Promise<InitializedLearningData> {
  const config = readSupabaseConfig(import.meta.env);
  const client = createSupabaseBrowserClient(config);
  const user = await ensureAuthenticatedUser(client.auth);
  const repository = createSupabaseLearningProgressRepository(createSupabaseGateway(client), user.id);
  await importLegacyProgress(window.localStorage, repository, user.id);
  let selectedTextbookId = await repository.getSelectedTextbookId();
  if (!selectedTextbookId) {
    selectedTextbookId = defaultTextbookId;
    await repository.setSelectedTextbookId(selectedTextbookId);
  }
  const events = await repository.loadEvents();
  return { userId: user.id, repository, events, selectedTextbookId };
}

export function LearningDataReadyProvider({
  children,
  userId,
  repository,
  initialEvents,
  initialSelectedTextbookId,
}: PropsWithChildren<{
  userId: string;
  repository: LearningProgressRepository;
  initialEvents: LearningEvent[];
  initialSelectedTextbookId: string;
}>) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedTextbookId, setSelectedTextbookId] = useState(initialSelectedTextbookId);
  const appendEvents = useCallback(async (next: LearningEvent[]) => {
    await repository.appendEvents(next);
    setEvents(current => {
      const merged = new Map(current.map(event => [event.id, event]));
      next.forEach(event => merged.set(event.id, event));
      return [...merged.values()];
    });
  }, [repository]);
  const selectTextbook = useCallback(async (textbookId: string) => {
    await repository.setSelectedTextbookId(textbookId);
    setSelectedTextbookId(textbookId);
  }, [repository]);
  const value = useMemo<LearningDataValue>(() => ({
    userId, repository, events, selectedTextbookId, appendEvents, selectTextbook,
  }), [userId, repository, events, selectedTextbookId, appendEvents, selectTextbook]);
  return <LearningDataContext.Provider value={value}>{children}</LearningDataContext.Provider>;
}

export function LearningDataProvider({
  children,
  initialize = initializeLearningData,
  defaultTextbookId = '',
}: PropsWithChildren<{ initialize?: (defaultTextbookId: string) => Promise<InitializedLearningData>; defaultTextbookId?: string }>) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; data?: InitializedLearningData }>({ status: 'loading' });
  const activeAttempt = useRef(0);
  const initialization = useRef<Promise<InitializedLearningData> | null>(null);
  useEffect(() => {
    const sequence = activeAttempt.current + 1;
    activeAttempt.current = sequence;
    setState({ status: 'loading' });
    const pending = initialization.current ?? initialize(defaultTextbookId);
    initialization.current = pending;
    void pending.then(
      data => { if (activeAttempt.current === sequence) setState({ status: 'ready', data }); },
      () => { if (activeAttempt.current === sequence) setState({ status: 'error' }); },
    );
    return () => { if (activeAttempt.current === sequence) activeAttempt.current += 1; };
  }, [initialize, attempt, defaultTextbookId]);

  if (state.status === 'loading') return <main className="data-startup" role="status"><h1>凑凑喵英语乐园</h1><p>正在连接线上学习档案…</p></main>;
  if (state.status === 'error' || !state.data) return <main className="data-startup" role="alert"><h1>线上学习档案暂时没有准备好</h1><p>请检查网络连接，稍后再试。你的旧浏览器记录不会被删除。</p><button type="button" onClick={() => { initialization.current = null; setAttempt(value => value + 1); }}>重新连接</button></main>;
  return <LearningDataReadyProvider userId={state.data.userId} repository={state.data.repository} initialEvents={state.data.events} initialSelectedTextbookId={state.data.selectedTextbookId}>{children}</LearningDataReadyProvider>;
}

export function useLearningData(): LearningDataValue {
  const value = useContext(LearningDataContext);
  if (!value) throw new Error('useLearningData must be used inside LearningDataProvider');
  return value;
}
