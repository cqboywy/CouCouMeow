import { describe, expect, it } from 'vitest';
import { hostedPreviewApi } from './hostedPreview';

describe('hosted preview learning data', () => {
  it('exposes every published extracurricular episode with the complete learning content', () => {
    const list = hostedPreviewApi('/episodes') as {items:Array<{id:string}>};
    const episode = hostedPreviewApi('/episodes/l1-001-dino-buddies-the-park') as {title:string;sentences:Array<{english:string}>;vocab:Array<{word:string}>;knowledge:Array<{title:string}>};
    const bat = hostedPreviewApi('/episodes/l1-bat-and-friends-001-hunting-for-bugs') as {title:string;sentences:Array<{english:string}>;vocab:Array<{word:string}>};

    expect(list.items.map(item => item.id)).toEqual(['l1-001-dino-buddies-the-park', 'l1-bat-and-friends-001-hunting-for-bugs', 'l1-bat-and-friends-002-lost-in-the-rain']);
    expect(episode.title).toBe('The Park');
    expect(episode.sentences).toHaveLength(8);
    expect(episode.sentences[0].english).toBe('One day Rex was in the park.');
    expect(episode.vocab.map(item => item.word)).toContain('help');
    expect(episode.knowledge).toHaveLength(2);
    expect(bat.title).toBe('Hunting for Bugs');
    expect(bat.sentences).toHaveLength(8);
    expect(bat.vocab.map(item => item.word)).toContain('cave');
  });
});
