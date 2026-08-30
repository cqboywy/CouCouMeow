import type { ContentCatalog, ExtraEpisode, SchoolLesson, SchoolPage } from './types';

export interface ContentRepository {
  loadCatalog(): Promise<ContentCatalog>;
  loadSchoolPage(contentKey: string): Promise<SchoolPage>;
  loadSchoolLesson(contentKey: string): Promise<SchoolLesson>;
  loadExtraEpisode(contentKey: string): Promise<ExtraEpisode>;
}

export class ContentIntegrityError extends Error {
  constructor(message: string) {
    super(`Content integrity error: ${message}`);
    this.name = 'ContentIntegrityError';
  }
}
