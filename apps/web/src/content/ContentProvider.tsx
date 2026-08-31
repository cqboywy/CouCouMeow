import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ensureAuthenticatedUser } from '../data/supabaseAuth';
import { createSupabaseBrowserClient, readSupabaseConfig } from '../data/supabaseConfig';
import { createSupabaseContentGateway } from './supabaseContentGateway';
import { createSupabaseContentRepository } from './supabaseContentRepository';
import type { ContentCatalog, ExtraEpisode, SchoolLesson, SchoolPage, SchoolTextbook, SchoolUnit } from './types';

type InitializedContent = { catalog: ContentCatalog };
type ContentValue = InitializedContent & {
  textbook: SchoolTextbook;
  getUnit(id: string): SchoolUnit | undefined;
  getLesson(id: string): SchoolLesson | undefined;
  getPage(id: string): SchoolPage | undefined;
  getExtraEpisode(id: string): ExtraEpisode | undefined;
};

const ContentContext = createContext<ContentValue | null>(null);

export async function initializeContent(): Promise<InitializedContent> {
  const client = createSupabaseBrowserClient(readSupabaseConfig(import.meta.env));
  await ensureAuthenticatedUser(client.auth);
  const repository = createSupabaseContentRepository(createSupabaseContentGateway(client));
  return { catalog: await repository.loadCatalog() };
}

export function ContentProvider({
  children,
  initialize = initializeContent,
}: PropsWithChildren<{ initialize?: () => Promise<InitializedContent> }>) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; data?: InitializedContent }>({ status: 'loading' });
  const activeAttempt = useRef(0);
  useEffect(() => {
    const sequence = activeAttempt.current + 1;
    activeAttempt.current = sequence;
    setState({ status: 'loading' });
    void initialize().then(
      data => { if (activeAttempt.current === sequence) setState({ status: 'ready', data }); },
      () => { if (activeAttempt.current === sequence) setState({ status: 'error' }); },
    );
    return () => { if (activeAttempt.current === sequence) activeAttempt.current += 1; };
  }, [initialize, attempt]);

  if (state.status === 'loading') return <main className="data-startup" role="status"><h1>凑凑喵英语乐园</h1><p>正在加载线上课程内容…</p></main>;
  if (state.status === 'error' || !state.data) return <main className="data-startup" role="alert"><h1>线上课程内容暂时没有准备好</h1><p>请检查网络连接，稍后再试。</p><button type="button" onClick={() => setAttempt(value => value + 1)}>重新连接</button></main>;
  return <ContentReadyProvider catalog={state.data.catalog}>{children}</ContentReadyProvider>;
}

export function ContentReadyProvider({ children, catalog }: PropsWithChildren<InitializedContent>) {
  const value = useMemo<ContentValue>(() => {
    const textbook = catalog.textbooks[0];
    if (!textbook) throw new Error('Published school textbook is required');
    const units = catalog.textbooks.flatMap(item => item.units);
    const lessons = units.flatMap(item => item.lessons);
    const pages = units.flatMap(item => item.pages);
    return {
      catalog,
      textbook,
      getUnit: id => units.find(item => item.id === id),
      getLesson: id => lessons.find(item => item.id === id),
      getPage: id => pages.find(item => item.id === id),
      getExtraEpisode: id => catalog.extraEpisodes.find(item => item.id === id),
    };
  }, [catalog]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent must be used inside ContentProvider');
  return value;
}
