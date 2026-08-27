import { describe, expect, it } from 'vitest';
import { hostedPreviewApi } from './hostedPreview';

describe('hosted preview learning data', () => {
  it('opens The Park with content that can be read aloud in the browser', () => {
    const episode = hostedPreviewApi('/episodes/l1-001-dino-buddies-the-park') as {title:string;sentences:Array<{english:string}>;vocab:Array<{word:string}>};

    expect(episode.title).toBe('The Park');
    expect(episode.sentences).toHaveLength(4);
    expect(episode.sentences[0].english).toBe('One day Rex was in the park.');
    expect(episode.vocab.map((item: { word: string }) => item.word)).toContain('park');
  });
});
