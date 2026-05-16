import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function TranslatorInput({ onTranslate, isLoading, mode }) {
  const [text, setText] = useState('');
  const [inputLang, setInputLang] = useState('es-ES');
  const { isListening, transcript, error, isSupported, startListening, stopListening } =
    useSpeechRecognition();

  const micLang = mode === 'response' ? 'ar-EG' : inputLang;

  // Clear text when switching modes
  useEffect(() => {
    setText('');
  }, [mode]);

  // When mic returns a transcript:
  // - always populate the text field
  // - in response mode, auto-submit immediately (no extra button tap needed)
  useEffect(() => {
    if (!transcript) return;
    setText(transcript);
    if (mode === 'response') {
      onTranslate(transcript);
    }
  }, [transcript]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !isLoading) onTranslate(text.trim());
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(micLang);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        {/* Translate mode: plain textarea */}
        {mode === 'translate' && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Escribí en español o inglés..."
            rows={3}
            className="w-full bg-surface border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 resize-none text-base"
          />
        )}

        {/* Response mode: mic-first + text fallback */}
        {mode === 'response' && (
          <div className="bg-surface border border-teal/30 rounded-2xl p-4 flex flex-col gap-3">
            <div className="text-center">
              <p className="text-teal text-sm font-medium">👂 Modo Respuesta</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Presioná el micrófono y hablá en árabe, o escribilo abajo
              </p>
            </div>

            {/* Text area for typing Arabic manually (fallback) */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="أو escribí el árabe acá..."
              rows={2}
              dir="auto"
              className="w-full bg-darkbg border border-teal/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-teal/50 resize-none text-base font-arabic text-right"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Language toggle (translate mode only) */}
          {mode === 'translate' && (
            <div className="flex items-center bg-surface rounded-full p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setInputLang('es-ES')}
                className={`px-3 py-1 rounded-full transition-all ${
                  inputLang === 'es-ES' ? 'bg-gold/20 text-gold' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                🇪🇸 ES
              </button>
              <button
                type="button"
                onClick={() => setInputLang('en-US')}
                className={`px-3 py-1 rounded-full transition-all ${
                  inputLang === 'en-US' ? 'bg-gold/20 text-gold' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          )}

          {/* Mic button */}
          {isSupported && (
            <button
              type="button"
              onClick={handleMicClick}
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : mode === 'response'
                  ? 'bg-teal/10 border-teal text-teal hover:bg-teal/20'
                  : 'bg-surface border-white/20 text-gray-400 hover:border-gold/50 hover:text-gold'
              }`}
              title={isListening ? 'Detener grabación' : `Hablar en ${micLang === 'ar-EG' ? 'árabe' : micLang === 'es-ES' ? 'español' : 'inglés'}`}
            >
              {isListening ? (
                <span className="text-xl">⏹</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
            </button>
          )}

          {/* Translate button */}
          {mode === 'translate' && (
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="flex-1 py-3 rounded-full font-semibold text-darkbg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gold hover:bg-gold/80 active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-darkbg/40 border-t-darkbg rounded-full animate-spin" />
                  Traduciendo...
                </span>
              ) : (
                'Traducir →'
              )}
            </button>
          )}

          {/* Response mode: manual submit (for typed Arabic) */}
          {mode === 'response' && (
            <button
              type="submit"
              disabled={!text.trim() || isLoading}
              className="flex-1 py-3 rounded-full font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-teal hover:bg-teal/80 active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Traduciendo...
                </span>
              ) : (
                '¿Qué dijo? →'
              )}
            </button>
          )}
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            Escuchando en {micLang === 'ar-EG' ? 'árabe' : micLang === 'es-ES' ? 'español' : 'inglés'}...
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </form>
    </div>
  );
}
