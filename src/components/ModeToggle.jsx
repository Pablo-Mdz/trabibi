const MODES = [
  { id: 'translate', label: 'Traducir',      emoji: '🌍', active: 'bg-gold text-darkbg' },
  { id: 'response',  label: 'Respuesta',     emoji: '👂', active: 'bg-teal text-white' },
  { id: 'convo',     label: 'Conversación',  emoji: '💬', active: 'bg-purple-500 text-white' },
];

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex items-center bg-surface rounded-full p-1 border border-white/10 gap-0.5">
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
            mode === m.id ? m.active : 'text-gray-400 hover:text-white'
          }`}
        >
          {m.emoji} {m.label}
        </button>
      ))}
    </div>
  );
}
