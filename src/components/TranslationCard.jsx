import AudioButton from './AudioButton';

const CATEGORY_LABELS = {
  greeting: { label: 'Saludo', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  food: { label: 'Comida', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  transport: { label: 'Transporte', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  shopping: { label: 'Compras', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  emergency: { label: '¡Emergencia!', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  smalltalk: { label: 'Conversación', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  other: { label: 'Otro', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function TranslationCard({ result, originalPhrase, onSave, isSaved, mode }) {
  if (!result) return null;

  // Reverse mode (Arabic → Spanish)
  if (mode === 'response') {
    return (
      <div className="bg-surface border border-teal/30 rounded-3xl p-6 flex flex-col gap-4 animate-fadeIn">
        <div className="flex items-center gap-2 text-teal text-sm font-medium">
          <span>👂</span> Modo Respuesta
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs mb-1">Lo que dijeron en árabe</p>
          <p className="text-gray-400 font-arabic text-right text-lg leading-relaxed">{originalPhrase}</p>
        </div>

        <div className="bg-teal/10 rounded-2xl p-4 text-center border border-teal/20">
          <p className="text-gray-500 text-xs mb-2">En español significa</p>
          <p className="text-white text-2xl font-bold leading-tight">{result.spanish}</p>
        </div>

        {result.phonetic && (
          <div className="text-center">
            <p className="text-gray-500 text-xs mb-1">Sonido árabe</p>
            <p className="text-teal font-mono text-lg">{result.phonetic}</p>
          </div>
        )}

        {result.notes && (
          <div className="flex gap-2 bg-white/5 rounded-xl p-3">
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-gray-400 text-sm leading-relaxed">{result.notes}</p>
          </div>
        )}
      </div>
    );
  }

  // Normal translation mode
  const cat = CATEGORY_LABELS[result.category] || CATEGORY_LABELS.other;

  return (
    <div className="bg-surface border border-white/10 rounded-3xl p-6 flex flex-col gap-5 animate-fadeIn">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-gray-500 text-xs mb-1">Original</p>
          <p className="text-gray-300 text-base italic">"{originalPhrase}"</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${cat.color} flex-shrink-0`}>
          {cat.label}
        </span>
      </div>

      {/* Arabic script */}
      <div className="bg-gradient-to-br from-gold/10 to-teal/10 border border-gold/20 rounded-2xl p-4">
        <p className="text-gray-500 text-xs mb-2 text-center">Árabe egipcio</p>
        <p
          className="text-gold text-3xl text-right leading-relaxed font-arabic"
          dir="rtl"
          style={{ fontFamily: "'Noto Sans Arabic', 'Arial Unicode MS', sans-serif" }}
        >
          {result.arabic}
        </p>
      </div>

      {/* Phonetic — main feature */}
      <div className="text-center">
        <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Pronunciación</p>
        <p className="text-white text-2xl font-bold tracking-wide">{result.phonetic}</p>
      </div>

      {/* Literal meaning */}
      <div className="text-center">
        <p className="text-gray-500 text-xs mb-1">Significado literal</p>
        <p className="text-gray-300 text-base">{result.literal}</p>
      </div>

      {/* Cultural tip */}
      {result.tips && (
        <div className="flex gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
          <span className="text-xl flex-shrink-0">🌙</span>
          <p className="text-gray-400 text-sm leading-relaxed">{result.tips}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <AudioButton arabicText={result.arabic} />
        <button
          onClick={onSave}
          disabled={isSaved}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
            isSaved
              ? 'border-gold/40 text-gold/60 cursor-default'
              : 'border-white/20 text-gray-400 hover:border-gold/50 hover:text-gold'
          }`}
        >
          {isSaved ? '✓ Guardado' : '+ Guardar'}
        </button>
      </div>
    </div>
  );
}
