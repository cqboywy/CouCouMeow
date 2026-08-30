import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { renderWithLearningData } from './test/renderWithLearningData';

afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('renders the official product names', () => {
    renderWithLearningData(<App />);

    expect(screen.getByRole('heading', { name: '凑凑喵英语乐园' })).toBeInTheDocument();
    expect(screen.getByText('CouCouMeow English Land')).toBeInTheDocument();
  });

  it('separates today, bookshelf, and progress into clear home sections', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [
        { id: 'l1-001-dino-buddies-the-park', level: 1, series_title: 'Dino Buddies', episode_number: 1, title: 'The Park', local_video_filename: '001_Dino Buddies 1_The Park.mp4', is_published: true, is_learned: false },
        { id: 'l1-bat-and-friends-001-hunting-for-bugs', level: 1, series_title: 'Bat and Friends', episode_number: 1, title: 'Hunting for Bugs', local_video_filename: '001_Bat and Friends 1_Hunting for Bugs.mp4', is_published: true, is_learned: false },
        { id: 'l1-bat-and-friends-002-lost-in-the-rain', level: 1, series_title: 'Bat and Friends', episode_number: 2, title: 'Lost in the Rain', local_video_filename: '002_Bat and Friends 2_Lost in the Rain.mp4', is_published: true, is_learned: false },
      ] }),
    }));
    renderWithLearningData(<App />);
    expect(screen.getByRole('heading', { name: '今天继续学习' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '今日学习' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /看故事学英语/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Level 1/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '剧集书架' }));
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 9/ })).toBeInTheDocument();
    expect(screen.getByText('Bat and Friends')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Bat and Friends/ }));
    expect(screen.getByText('第 1 集 · Hunting for Bugs')).toBeInTheDocument();
    expect(screen.getByText('第 2 集 · Lost in the Rain')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '成长记录' }));
    expect(screen.getByRole('heading', { name: '我的成长记录' })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('opens an episode learning view', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/stats')) return { ok: true, json: async () => ({ learned_episodes: 0, total_words: 17, practice_count: 0, mistake_count: 0 }) };
      if (url.endsWith('/episodes')) return { ok: true, json: async () => ({ items: [{ id: 'l1-001-dino-buddies-the-park', level: 1, title: 'Dino Buddies 1: The Park', local_video_filename: '001_Dino Buddies 1_The Park.mp4', is_published: true, is_learned: false }] }) };
      return { ok: true, json: async () => ({
        id: 'l1-001-dino-buddies-the-park', level: 1, title: 'Dino Buddies 1: The Park',
        chinese_title: '恐龙伙伴：公园奇遇', local_video_filename: '001_Dino Buddies 1_The Park.mp4',
        story_summary: 'Rex 想和其他恐龙交朋友，却被大家误会了。',
        story_theme: '不要只凭外表判断别人。',
        sentences: [{ id: 'sentence-1', english: 'One day Rex was in the park.', chinese: '一天，Rex 在公园里。', is_featured: true }],
        vocab: [{ id: 'vocab-park', word: 'park', phonetic: '/pɑːk/', meaning: '公园' }],
        knowledge: [{ id: 'knowledge-1', title: 'was / were + 地点', explanation: '表示过去在哪里。', examples: ['I was in the library.'] }],
        comprehension_questions: ['Rex 在哪里？'], retell_steps: ['Rex 来到公园。'],
        past_tense_pairs: [{ base: 'see', past: 'saw', meaning: '看见' }],
      }) };
    }));
    renderWithLearningData(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /继续学习/ }));
    expect(await screen.findByText('请在本地打开对应视频观看')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '恐龙伙伴：公园奇遇' })).toBeInTheDocument();
    expect(screen.getByText('Rex 想和其他恐龙交朋友，却被大家误会了。')).toBeInTheDocument();
    expect(screen.getByText('完整台词（1句）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始单词听写' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '朗读句子：One day Rex was in the park.' })[0]);
    expect(screen.getByRole('status')).toHaveTextContent('这台设备暂时不能朗读英文');
    fireEvent.click(screen.getByRole('button', { name: '回到小书架' }));
    expect(screen.getByRole('button', { name: /Level 1/ })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('shows preparing, playing, and failed states for sentence narration', async () => {
    const utterances: Array<{ onstart: (() => void) | null; onerror: ((event: { error: string }) => void) | null }> = [];
    class TestUtterance {
      lang = '';
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      constructor(public text: string) { utterances.push(this); }
    }
    const voice = { lang: 'en-US', name: 'Test English', localService: true, default: true, voiceURI: 'test' } as SpeechSynthesisVoice;
    vi.stubGlobal('SpeechSynthesisUtterance', TestUtterance);
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [voice],
      cancel: vi.fn(),
      speak: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      speaking: false,
      pending: false,
    });
    const detail = {
      id: 'l1-001-dino-buddies-the-park', level: 1, series_title: 'Dino Buddies', episode_number: 1, title: 'Dino Buddies 1: The Park', chinese_title: '恐龙伙伴：公园奇遇', local_video_filename: '001_Dino Buddies 1_The Park.mp4', story_summary: '故事简介', story_theme: '故事主题', is_published: true, is_learned: false,
      sentences: [{ id: 'sentence-1', english: 'One day Rex was in the park.', chinese: '一天，Rex 在公园里。', is_featured: true }], vocab: [], knowledge: [], comprehension_questions: [], retell_steps: [], past_tense_pairs: [],
    };
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes') ? { items: [detail] } : url.endsWith('/stats') ? { learned_episodes: 0, total_words: 17, practice_count: 0, mistake_count: 0 } : detail;
      return { ok: true, json: async () => body };
    }));

    renderWithLearningData(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /继续学习/ }));
    const play = (await screen.findAllByRole('button', { name: '朗读：One day Rex was in the park.' }))[0];
    fireEvent.click(play);

    expect(screen.getByRole('status')).toHaveTextContent('正在启动英文朗读');
    act(() => utterances[0]?.onstart?.());
    expect(screen.getByRole('status')).toHaveTextContent('正在朗读：One day Rex was in the park.');
    act(() => utterances[0]?.onerror?.({ error: 'synthesis-failed' }));
    expect(play.closest('article')).toHaveTextContent('英文朗读正在加载中，请稍等。');
  });

  it('provides previous and next controls during dictation', async () => {
    const episode = {
      id: 'l1-001-dino-buddies-the-park', level: 1, title: 'Dino Buddies 1: The Park',
      chinese_title: '恐龙伙伴：公园奇遇', local_video_filename: '001_Dino Buddies 1_The Park.mp4',
      story_summary: '故事简介', story_theme: '故事主题', is_published: true, is_learned: false,
      sentences: [
        { id: 'sentence-1', english: 'One day Rex was in the park.', chinese: '一天，Rex 在公园里。', is_featured: true },
        { id: 'sentence-2', english: 'They ran away.', chinese: '他们跑开了。', is_featured: true },
      ],
      vocab: [
        { id: 'vocab-park', word: 'park', phonetic: '/pɑːk/', meaning: '公园' },
        { id: 'vocab-tree', word: 'tree', phonetic: '/triː/', meaning: '树' },
      ],
      knowledge: [], comprehension_questions: [], retell_steps: [], past_tense_pairs: [],
    };
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes') ? { items: [episode] } : url.endsWith('/stats') ? { learned_episodes: 0, total_words: 2, practice_count: 0, mistake_count: 0 } : episode;
      return { ok: true, json: async () => body };
    }));
    renderWithLearningData(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /继续学习/ }));
    fireEvent.click(await screen.findByRole('button', { name: '2. 单词听写' }));
    expect(screen.getByRole('button', { name: '写出来' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '说出来' })).toBeInTheDocument();
    const previous = screen.getByRole('button', { name: '上一题' });
    const next = screen.getByRole('button', { name: '下一题' });
    expect(previous).toBeDisabled();
    expect(next).toBeEnabled();
    expect(screen.getByText('第 1 / 2 题')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('我写的是'), { target: { value: 'park' } });
    fireEvent.click(next);
    expect(screen.getByLabelText('我写的是')).toHaveValue('');
    expect(screen.getByText('树')).toBeInTheDocument();
    expect(previous).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: '3. 句子跟读' }));
    expect(screen.getByRole('button', { name: '完成本句跟读' })).toBeDisabled();
    expect(screen.queryByText('录音后会自动识别；也可以在这里修正文字')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '上一题' })).toBeDisabled();
    expect(screen.getByText('第 1 / 2 题')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '下一题' }));
    expect(screen.getByRole('heading', { name: 'They ran away.' })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('shows dictation feedback immediately below the submitted answer', async () => {
    const episode = {
      id: 'l1-bat-and-friends-002-lost-in-the-rain', level: 1, series_title: 'Bat and Friends', episode_number: 2, title: 'Lost in the Rain',
      chinese_title: '蝙蝠和朋友们：雨中迷路', local_video_filename: '002_Bat and Friends 2_Lost in the Rain.mp4', story_summary: '故事简介', story_theme: '故事主题', is_published: true, is_learned: false,
      sentences: [{ id: 'bat-2-sentence-1', english: 'I am wet.', chinese: '我湿了。', is_featured: true }],
      vocab: [{ id: 'bat-2-vocab-wet', word: 'wet', phonetic: '/wet/', meaning: '湿的' }],
      knowledge: [], comprehension_questions: [], retell_steps: [], past_tense_pairs: [],
    };
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      const body = url.endsWith('/episodes') ? { items: [episode] } : url.endsWith('/stats') ? { learned_episodes: 0, total_words: 1, practice_count: 0, mistake_count: 0 } : url.endsWith('/practice/dictation') ? { attempt_id: 'wet-attempt', is_correct: true, message: '太棒啦，这个单词被你抓住了！', similarity: null } : episode;
      return { ok: true, json: async () => body };
    }));
    renderWithLearningData(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /继续学习/ }));
    fireEvent.click(await screen.findByRole('button', { name: '2. 单词听写' }));
    fireEvent.change(screen.getByLabelText('我写的是'), { target: { value: 'wet' } });
    fireEvent.click(screen.getByRole('button', { name: '交给凑凑喵检查' }));

    const feedback = await screen.findByRole('status');
    const navigator = screen.getByRole('navigation', { name: '题目切换' });
    expect(feedback).toHaveTextContent('太棒啦，这个单词被你抓住了！');
    expect(feedback).not.toHaveTextContent('相似度：0%');
    expect(feedback.compareDocumentPosition(navigator) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    vi.unstubAllGlobals();
  });
});
