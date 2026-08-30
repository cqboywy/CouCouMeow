import { describe, expect, it } from 'vitest';
import { createSupabaseContentRepository } from './supabaseContentRepository';
import type { ContentRows } from './supabaseContentGateway';

const rows = (): ContentRows => ({
  textbooks: [{ id: 't1', content_key: 'pep-grade4-upper', curriculum: 'PEP', grade: 4, semester: 'upper', title: 'PEP 四上', current_unit_key: 'u1', content_status: 'published' }],
  units: [{ id: 'u-uuid', textbook_id: 't1', content_key: 'u1', sequence_no: 1, title: 'Unit 1', chinese_title: '第一单元', big_question: '', big_question_chinese: '', objectives: [] }],
  lessons: [],
  pages: [
    { id: 'p3-uuid', textbook_id: 't1', unit_id: 'u-uuid', content_key: 'p3', printed_page: 3, title: 'Page 3', chinese_title: '第三页', schema_version: 1, sections: [], practice_prompts: [], finish_items: [] },
    { id: 'p2-uuid', textbook_id: 't1', unit_id: 'u-uuid', content_key: 'p2', printed_page: 2, title: 'Page 2', chinese_title: '第二页', schema_version: 1, sections: [], practice_prompts: [], finish_items: [] },
  ],
  items: [{ id: 'i-uuid', textbook_id: 't1', unit_id: 'u-uuid', content_key: 'family', item_kind: 'word', english: 'family', chinese: '家庭', phonetic: null, attributes: {} }],
  lessonItems: [],
  pageItems: [{ page_id: 'p2-uuid', item_id: 'i-uuid', sequence_no: 1, item_role: 'focus', source: 'body', note: '重点' }],
  exercises: [],
  episodes: [{ id: 'e-uuid', content_key: 'the-park', level: 1, series_title: 'Dino Buddies', episode_number: 1, title: 'The Park', chinese_title: '公园奇遇', local_video_filename: 'park.mp4', local_srt_filename: null, media_provider: 'storage', media_locator: 'videos/park.mp4', story_summary: '完整故事', story_theme: '友善', comprehension_questions: ['发生了什么？'], retell_steps: ['先到公园'], past_tense_pairs: [{ base: 'see', past: 'saw', meaning: '看见' }], content_status: 'published' }],
  sentences: [{ id: 's-uuid', episode_id: 'e-uuid', content_key: 'sentence-1', sequence_no: 1, english_text: 'Hello.', chinese_translation: '你好。', is_featured: true }],
  vocab: [{ id: 'v-uuid', episode_id: 'e-uuid', content_key: 'hello', sequence_no: 1, word: 'hello', phonetic: '/həˈləʊ/', chinese_meaning: '你好' }],
  knowledge: [{ id: 'k-uuid', episode_id: 'e-uuid', content_key: 'greeting', sequence_no: 1, title: 'Greeting', grammar_explanation: '问候语', core_knowledge: '用于见面', examples: ['Hello!'] }],
});

const repository = (contentRows: ContentRows) => createSupabaseContentRepository({ loadRows: async () => contentRows });

describe('Supabase content repository', () => {
  it('maps UUID relations to stable keys and orders pages', async () => {
    const catalog = await repository(rows()).loadCatalog();
    expect(catalog.textbooks[0].units[0].pages.map(page => page.id)).toEqual(['p2', 'p3']);
    expect(catalog.textbooks[0].units[0].pages[0].focusItems[0]).toMatchObject({ id: 'family', english: 'family' });
  });

  it('preserves complete extracurricular episode details', async () => {
    const episode = await repository(rows()).loadExtraEpisode('the-park');
    expect(episode).toMatchObject({
      storySummary: '完整故事',
      media: { provider: 'storage', locator: 'videos/park.mp4' },
      comprehensionQuestions: ['发生了什么？'],
      sentences: [{ id: 'sentence-1', isFeatured: true }],
      knowledge: [{ examples: ['Hello!'] }],
    });
  });

  it('rejects unpublished roots, empty catalogs, and broken references', async () => {
    const unpublished = rows();
    unpublished.textbooks[0].content_status = 'draft';
    await expect(repository(unpublished).loadCatalog()).rejects.toThrow('unpublished');

    const empty = rows();
    empty.textbooks = [];
    empty.episodes = [];
    await expect(repository(empty).loadCatalog()).rejects.toThrow('empty');

    const broken = rows();
    broken.pageItems[0].item_id = 'missing';
    await expect(repository(broken).loadCatalog()).rejects.toThrow('missing item');
  });
});
