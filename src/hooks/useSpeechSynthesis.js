import { useState, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasArabicVoice, setHasArabicVoice] = useState(null);

  const isSupported = 'speechSynthesis' in window;

  const getArabicVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang.startsWith('ar')) ||
      voices.find((v) => v.lang.includes('ar')) ||
      null
    );
  }, []);

  const speak = useCallback(
    (text) => {
      if (!isSupported || !text) return;

      window.speechSynthesis.cancel();

      const loadVoicesAndSpeak = () => {
        const arabicVoice = getArabicVoice();
        setHasArabicVoice(!!arabicVoice);

        const utterance = new SpeechSynthesisUtterance(text);
        if (arabicVoice) {
          utterance.voice = arabicVoice;
          utterance.lang = arabicVoice.lang;
        } else {
          utterance.lang = 'ar-EG';
        }
        utterance.rate = 0.85;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      };

      // Voices may not be loaded yet on first call
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak;
      } else {
        loadVoicesAndSpeak();
      }
    },
    [isSupported, getArabicVoice]
  );

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, hasArabicVoice, isSupported, speak, cancel };
}
