import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { translateToArabic, translateFromArabic } from '../services/claudeApi';

export default function ConversationMode() {
  const [turns, setTurns] = useState([]);
  const [activeRole, setActiveRole] = useState(null); // 'me' | 'them' | null
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const { isListening, transcript, startListening, stopListening, error: micError } =
    useSpeechRecognition();
  const { speak, isSpeaking } = useSpeechSynthesis();

  // Scroll to bottom whenever turns update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, loadingRole]);

  // When mic returns a transcript, process it
  useEffect(() => {
    if (!transcript || !activeRole) return;
    handleTranscript(transcript, activeRole);
    setActiveRole(null);
  }, [transcript]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleTranscript(text, role) {
    setLoadingRole(role);
    setError(null);

    try {
      if (role === 'them') {
        // Arabic → Spanish
        const result = await translateFromArabic(text);
        setTurns(prev => [...prev, {
          id: Date.now(),
          speaker: 'them',
          original: text,
          translation: result.spanish,
          phonetic: result.phonetic,
          notes: result.notes,
        }]);
      } else {
        // Spanish → Arabic + auto-speak so the other person hears it
        const result = await translateToArabic(text);
        setTurns(prev => [...prev, {
          id: Date.now(),
          speaker: 'me',
          original: text,
          translation: result.arabic,
          phonetic: result.phonetic,
          literal: result.literal,
        }]);
        // Speak the Arabic out loud so the other person can hear from the phone
        speak(result.arabic);
      }
    } catch (err) {
      setError(err.message || 'Error al traducir');
    } finally {
      setLoadingRole(null);
    }
  }

  function handleMicPress(role) {
    if (isListening) {
      stopListening();
      setActiveRole(null);
      return;
    }
    setError(null);
    setActiveRole(role);
    startListening(role === 'them' ? 'ar-EG' : 'es-ES');
  }

  const isThemListening = isListening && activeRole === 'them';
  const isMeListening = isListening && activeRole === 'me';
  const isThemLoading = loadingRole === 'them';
  const isMeLoading = loadingRole === 'me';
  const busy = isListening || !!loadingRole || isSpeaking;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Header hint */}
      <div className="text-center py-3 px-4 flex-shrink-0">
        <p className="text-xs text-gray-500">
          Presioná el botón de quien va a hablar. El árabe se escucha en voz alta.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3 min-h-[200px]">
        {turns.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-10">
            <span className="text-5xl">💬</span>
            <p className="text-gray-500 text-sm max-w-xs">
              Empezá la conversación. Cuando ellos hablen presioná{' '}
              <span className="text-teal font-medium">Ellos hablan</span>, y cuando
              sea tu turno presioná{' '}
              <span className="text-gold font-medium">Yo respondo</span>.
            </p>
          </div>
        )}

        {turns.map(turn => (
          <ChatBubble key={turn.id} turn={turn} onSpeak={speak} isSpeaking={isSpeaking} />
        ))}

        {/* Loading bubble */}
        {loadingRole && (
          <div className={`flex ${loadingRole === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-4 py-3 max-w-[80%] flex gap-2 items-center ${
              loadingRole === 'me'
                ? 'bg-gold/10 border border-gold/20'
                : 'bg-teal/10 border border-teal/20'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="flex justify-end">
            <div className="bg-gold/20 border border-gold/30 rounded-full px-4 py-2 flex items-center gap-2 text-gold text-sm">
              <span className="animate-pulse">🔊</span>
              Hablando en árabe...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mx-4 mb-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex-shrink-0">
          {error}
        </div>
      )}
      {micError && (
        <div className="mx-4 mb-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex-shrink-0">
          {micError}
        </div>
      )}

      {/* Controls */}
      <div className="flex-shrink-0 px-4 pb-6 pt-3 border-t border-white/10">
        <div className="flex gap-3">

          {/* THEM button */}
          <MicButton
            role="them"
            label="Ellos hablan"
            sublabel="árabe"
            emoji="👂"
            isListening={isThemListening}
            isLoading={isThemLoading}
            disabled={busy && !isThemListening}
            color="teal"
            onPress={() => handleMicPress('them')}
          />

          {/* ME button */}
          <MicButton
            role="me"
            label="Yo respondo"
            sublabel="español"
            emoji="🗣️"
            isListening={isMeListening}
            isLoading={isMeLoading}
            disabled={busy && !isMeListening}
            color="gold"
            onPress={() => handleMicPress('me')}
          />
        </div>

        {/* Clear button */}
        {turns.length > 0 && (
          <button
            onClick={() => setTurns([])}
            className="w-full mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors py-1"
          >
            Limpiar conversación
          </button>
        )}
      </div>
    </div>
  );
}

function MicButton({ label, sublabel, emoji, isListening, isLoading, disabled, color, onPress }) {
  const colorStyles = {
    teal: {
      active: 'bg-teal border-teal text-white shadow-teal/30',
      idle:   'bg-teal/10 border-teal/50 text-teal hover:bg-teal/20',
      disabled: 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed',
    },
    gold: {
      active: 'bg-gold border-gold text-darkbg shadow-gold/30',
      idle:   'bg-gold/10 border-gold/50 text-gold hover:bg-gold/20',
      disabled: 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed',
    },
  };

  const styles = colorStyles[color];
  const stateClass = isListening
    ? `${styles.active} shadow-lg scale-105 animate-pulse`
    : disabled
    ? styles.disabled
    : styles.idle;

  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 transition-all duration-200 ${stateClass}`}
    >
      {isLoading ? (
        <span className={`w-7 h-7 border-2 border-current/30 border-t-current rounded-full animate-spin`} />
      ) : (
        <span className="text-3xl">{isListening ? '⏹' : emoji}</span>
      )}
      <div className="text-center">
        <p className="font-bold text-sm leading-tight">
          {isListening ? 'Detener' : label}
        </p>
        {!isListening && (
          <p className="text-xs opacity-60 mt-0.5">{sublabel}</p>
        )}
      </div>
    </button>
  );
}

function ChatBubble({ turn, onSpeak, isSpeaking }) {
  const isMe = turn.speaker === 'me';

  return (
    <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
      <span className="text-xs text-gray-600 px-1">
        {isMe ? 'Vos (español → árabe)' : 'Ellos (árabe → español)'}
      </span>

      <div className={`max-w-[85%] rounded-2xl p-4 flex flex-col gap-2 ${
        isMe
          ? 'bg-gold/10 border border-gold/20 rounded-tr-sm'
          : 'bg-teal/10 border border-teal/20 rounded-tl-sm'
      }`}>
        {/* Original text */}
        <p className="text-gray-400 text-xs italic">"{turn.original}"</p>

        {isMe ? (
          <>
            {/* Arabic translation (big, RTL) */}
            <p
              className="text-gold text-2xl text-right leading-relaxed"
              dir="rtl"
              style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
            >
              {turn.translation}
            </p>
            {/* Phonetic */}
            <p className="text-white font-bold text-lg tracking-wide">{turn.phonetic}</p>
            {/* Re-speak button */}
            <button
              onClick={() => onSpeak(turn.translation)}
              disabled={isSpeaking}
              className="self-end flex items-center gap-1.5 text-xs text-gold/60 hover:text-gold transition-colors mt-1"
            >
              <span>🔊</span> Repetir
            </button>
          </>
        ) : (
          <>
            {/* Spanish translation (big) */}
            <p className="text-white font-bold text-xl leading-tight">{turn.translation}</p>
            {/* Phonetic (what they said in Latin chars) */}
            {turn.phonetic && (
              <p className="text-teal text-sm font-mono">{turn.phonetic}</p>
            )}
            {/* Notes */}
            {turn.notes && (
              <p className="text-gray-500 text-xs">{turn.notes}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
