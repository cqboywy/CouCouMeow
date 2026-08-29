import { useCallback, useEffect, useRef, useState } from 'react';

export type EnglishSpeechPhase = 'idle' | 'preparing' | 'speaking' | 'error';

type EnglishSpeechState = {
  phase: EnglishSpeechPhase;
  message: string;
  activeText: string | null;
  activeKey: string | null;
};

const unsupportedMessage = '这台设备暂时不能朗读英文，可以换 Safari、Chrome 或 Edge 试试。';
const loadingMessage = '英文朗读正在加载中，请稍等。';

function englishVoice() {
  return window.speechSynthesis.getVoices().find(voice => /^en(?:-|_)/i.test(voice.lang));
}

export function useEnglishSpeech() {
  const [state, setState] = useState<EnglishSpeechState>({ phase: 'idle', message: '', activeText: null, activeKey: null });
  const pendingText = useRef<string | null>(null);
  const pendingKey = useRef<string | null>(null);
  const attempt = useRef(0);
  const launchTimer = useRef<number | undefined>(undefined);
  const fallbackTimer = useRef<number | undefined>(undefined);

  const clearTimers = useCallback(() => {
    if (launchTimer.current !== undefined) window.clearTimeout(launchTimer.current);
    if (fallbackTimer.current !== undefined) window.clearTimeout(fallbackTimer.current);
    launchTimer.current = undefined;
    fallbackTimer.current = undefined;
  }, []);

  const start = useCallback((text: string, voice: SpeechSynthesisVoice, key: string) => {
    const synthesis = window.speechSynthesis;
    const currentAttempt = ++attempt.current;
    let started = false;
    clearTimers();
    pendingText.current = null;
    pendingKey.current = null;
    setState({ phase: 'preparing', message: '正在启动英文朗读…', activeText: text, activeKey: key });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.voice = voice;
    utterance.onstart = () => {
      if (attempt.current !== currentAttempt) return;
      started = true;
      if (fallbackTimer.current !== undefined) window.clearTimeout(fallbackTimer.current);
      setState({ phase: 'speaking', message: `正在朗读：${text}`, activeText: text, activeKey: key });
    };
    utterance.onend = () => {
      if (attempt.current === currentAttempt) setState({ phase: 'idle', message: '朗读完成。', activeText: null, activeKey: null });
    };
    utterance.onerror = event => {
      if (attempt.current !== currentAttempt || event.error === 'canceled' || event.error === 'interrupted') return;
      clearTimers();
      setState({ phase: 'error', message: loadingMessage, activeText: text, activeKey: key });
    };

    synthesis.cancel();
    launchTimer.current = window.setTimeout(() => {
      if (attempt.current !== currentAttempt) return;
      synthesis.speak(utterance);
      fallbackTimer.current = window.setTimeout(() => {
        if (!started && attempt.current === currentAttempt) setState({ phase: 'error', message: loadingMessage, activeText: text, activeKey: key });
      }, 2500);
    }, 50);
  }, [clearTimers]);

  const speak = useCallback((text: string, key = text) => {
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      setState({ phase: 'error', message: unsupportedMessage, activeText: text, activeKey: key });
      return;
    }
    const voice = englishVoice();
    if (!voice) {
      const currentAttempt = ++attempt.current;
      pendingText.current = text;
      pendingKey.current = key;
      clearTimers();
      setState({ phase: 'preparing', message: '正在准备英文声音，请稍候。', activeText: text, activeKey: key });
      fallbackTimer.current = window.setTimeout(() => {
        if (pendingText.current && attempt.current === currentAttempt) setState({ phase: 'error', message: loadingMessage, activeText: text, activeKey: key });
      }, 2500);
      return;
    }
    start(text, voice, key);
  }, [clearTimers, start]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;
    const synthesis = window.speechSynthesis;
    const warmEnglishVoice = () => {
      const text = pendingText.current;
      const key = pendingKey.current;
      const voice = englishVoice();
      if (text && key && voice) start(text, voice, key);
    };
    synthesis.getVoices();
    synthesis.addEventListener('voiceschanged', warmEnglishVoice);
    return () => {
      clearTimers();
      synthesis.removeEventListener('voiceschanged', warmEnglishVoice);
    };
  }, [clearTimers, start]);

  return { ...state, speak };
}
