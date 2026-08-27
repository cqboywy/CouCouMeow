import { describe, expect, it } from 'vitest';
import { getExtraRecommendation } from './extraRecommendations';

describe('extra recommendations', () => {
  it('keeps an optional animation companion for each supported textbook unit', () => {
    expect(getExtraRecommendation('pep4a-u1')?.episodeId).toBe('l1-001-dino-buddies-the-park');
    expect(getExtraRecommendation('pep4a-u2')?.episodeId).toBe('l1-bat-and-friends-002-lost-in-the-rain');
    expect(getExtraRecommendation('unknown-unit')).toBeUndefined();
  });
});
