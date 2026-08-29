import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEnglishSpeech } from './useEnglishSpeech';

describe('useEnglishSpeech', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('warms the page voice and clears the completed status shortly after narration ends', () => {
    vi.useFakeTimers();
    const utterances: Array<{ onstart: (() => void) | null; onend: (() => void) | null }> = [];
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
    const getVoices = vi.fn(() => [voice]);
    vi.stubGlobal('SpeechSynthesisUtterance', TestUtterance);
    vi.stubGlobal('speechSynthesis', { getVoices, cancel: vi.fn(), speak: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn() });

    const { result } = renderHook(() => useEnglishSpeech());

    act(() => result.current.preload(['How do you help at home?', 'Can you help?']));
    expect(getVoices).toHaveBeenCalled();

    act(() => result.current.speak('Can you help?', 'sentence-1'));
    act(() => vi.advanceTimersByTime(50));
    act(() => utterances[0]?.onstart?.());
    act(() => utterances[0]?.onend?.());
    expect(result.current.message).toBe('朗读完成。');

    act(() => vi.advanceTimersByTime(1200));
    expect(result.current).toMatchObject({ phase: 'idle', message: '', activeText: null, activeKey: null });
  });
});
