import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, any>;
export type ContentRows = {
  textbooks: Row[]; units: Row[]; lessons: Row[]; pages: Row[]; items: Row[];
  lessonItems: Row[]; pageItems: Row[]; exercises: Row[];
  episodes: Row[]; sentences: Row[]; vocab: Row[]; knowledge: Row[];
};

export interface SupabaseContentGateway { loadRows(): Promise<ContentRows> }

export function createSupabaseContentGateway(client: SupabaseClient): SupabaseContentGateway {
  const read = async (table: string): Promise<Row[]> => {
    const { data, error } = await client.from(table).select('*');
    if (error) throw new Error(`Supabase content request failed: ${table}`);
    return (data ?? []) as Row[];
  };
  return {
    async loadRows() {
      const [textbooks, units, lessons, pages, items, lessonItems, pageItems, exercises, episodes, sentences, vocab, knowledge] = await Promise.all([
        read('school_textbooks'), read('school_units'), read('school_lessons'), read('school_pages'),
        read('school_content_items'), read('school_lesson_items'), read('school_page_items'), read('school_exercises'),
        read('lf_episodes'), read('lf_sentences'), read('lf_vocab'), read('lf_knowledge'),
      ]);
      return { textbooks, units, lessons, pages, items, lessonItems, pageItems, exercises, episodes, sentences, vocab, knowledge };
    },
  };
}
