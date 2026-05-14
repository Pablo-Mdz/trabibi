import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function AudioButton({ arabicText, className = '' }) {
  const { isSpeaking, hasArabicVoice, isSupported, speak, cancel } = useSpeechSynthesis();

  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(arabicText);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
          isSpeaking
            ? 'bg-gold text-darkbg animate-pulse'
            : 'bg-teal/20 border border-teal text-teal hover:bg-teal/30'
        } ${className}`}
        title={isSpeaking ? 'Detener audio' : 'Escuchar pronunciación árabe'}
      >
        {isSpeaking ? (
          <>
            <span className="text-lg">⏹</span>
            <span className="text-sm">Detener</span>
          </>
        ) : (
          <>
            <span className="text-lg">🔊</span>
            <span className="text-sm">Escuchar</span>
          </>
        )}
      </button>
      {hasArabicVoice === false && (
        <p className="text-xs text-gray-500 text-center max-w-[200px]">
          No hay voz árabe disponible. Mostrá la fonética para pronunciar.
        </p>
      )}
    </div>
  );
}
