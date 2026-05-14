export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex items-center bg-surface rounded-full p-1 border border-white/10">
      <button
        onClick={() => onChange('translate')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === 'translate'
            ? 'bg-gold text-darkbg'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        🌍 Traducir
      </button>
      <button
        onClick={() => onChange('response')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === 'response'
            ? 'bg-teal text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        👂 Modo Respuesta
      </button>
    </div>
  );
}
