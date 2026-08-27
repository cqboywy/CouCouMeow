import { describe, expect, it } from 'vitest';
import { getLocalExtraEpisode, localExtraEpisodes } from './localExtraContent';

describe('local extracurricular content', () => {
  it('keeps the three imported Level 1 episodes available when the local API is offline', () => {
    expect(localExtraEpisodes.map(item => item.title)).toEqual([
      'The Park',
      'Hunting for Bugs',
      'Lost in the Rain',
    ]);
  });

  it('opens every imported episode with learning materials', () => {
    for (const item of localExtraEpisodes) {
      const episode = getLocalExtraEpisode(item.id);
      expect(episode?.sentences.length).toBeGreaterThan(0);
      expect(episode?.vocab.length).toBeGreaterThan(0);
      expect(episode?.knowledge.length).toBeGreaterThan(0);
    }
  });
});
