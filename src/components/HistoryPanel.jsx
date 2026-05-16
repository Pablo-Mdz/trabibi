import { useState } from 'react';

const CATEGORIES = ['all', 'greeting', 'food', 'transport', 'shopping', 'emergency', 'smalltalk', 'other'];
const CATEGORY_LABELS = {
  all: 'Todos',
  greeting: 'Saludos',
  food: 'Comida',
  transport: 'Transporte',
  shopping: 'Compras',
  emergency: 'Emergencia',
  smalltalk: 'Conversación',
  other: 'Otros',
};

export default function HistoryPanel({ history, onSelect, onToggleFavorite, onRemove, onClear, isOpen, onClose, embedded = false }) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filtered = history.filter((e) => {
    if (showFavoritesOnly && !e.favorite) return false;
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    return true;
  });

  if (embedded) {
    return <HistoryContent filtered={filtered} history={history} onSelect={onSelect} onToggleFavorite={onToggleFavorite} onRemove={onRemove} onClear={onClear} filterCategory={filterCategory} setFilterCategory={setFilterCategory} showFavoritesOnly={showFavoritesOnly} setShowFavoritesOnly={setShowFavoritesOnly} onClose={onClose} />;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 lg:static lg:block z-40 bg-darkbg border-t lg:border-t-0 lg:border-l border-white/10 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
        } lg:h-full overflow-hidden flex flex-col`}
        style={{ maxHeight: isOpen ? '80vh' : undefined }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold text-base">Historial</h2>
            <span className="text-xs text-gray-500">{history.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-1.5 rounded-full transition-all ${
                showFavoritesOnly ? 'text-gold' : 'text-gray-600 hover:text-gray-400'
              }`}
              title="Solo favoritos"
            >
              {showFavoritesOnly ? '★' : '☆'}
            </button>
            {history.length > 0 && (
              <button
                onClick={() => { if (confirm('¿Limpiar todo el historial?')) onClear(); }}
                className="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
              >
                Limpiar
              </button>
            )}
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white p-1">
              ✕
            </button>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto flex-shrink-0 scrollbar-hide border-b border-white/5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                filterCategory === cat
                  ? 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-surface text-gray-500 border border-white/10 hover:text-gray-300'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-600 text-sm gap-2">
              <span className="text-2xl">📭</span>
              {history.length === 0 ? 'Guardá traducciones aquí' : 'Sin resultados'}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((entry) => (
                <HistoryEntry
                  key={entry.id}
                  entry={entry}
                  onSelect={() => { onSelect(entry); onClose(); }}
                  onToggleFavorite={() => onToggleFavorite(entry.id)}
                  onRemove={() => onRemove(entry.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function HistoryContent({ filtered, history, onSelect, onToggleFavorite, onRemove, onClear, filterCategory, setFilterCategory, showFavoritesOnly, setShowFavoritesOnly, onClose }) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">Historial</span>
          <span className="text-xs text-gray-500">{history.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-1.5 rounded-full transition-all text-lg ${showFavoritesOnly ? 'text-gold' : 'text-gray-600 hover:text-gray-400'}`}
            title="Solo favoritos"
          >
            {showFavoritesOnly ? '★' : '☆'}
          </button>
          {history.length > 0 && (
            <button
              onClick={() => { if (confirm('¿Limpiar todo el historial?')) onClear(); }}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all flex-shrink-0 ${
              filterCategory === cat
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-surface text-gray-500 border border-white/10 hover:text-gray-300'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Entries */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-gray-600 text-sm gap-2">
          <span className="text-2xl">📭</span>
          {history.length === 0 ? 'Guardá traducciones aquí' : 'Sin resultados'}
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {filtered.map((entry) => (
            <HistoryEntry
              key={entry.id}
              entry={entry}
              onSelect={() => onSelect(entry)}
              onToggleFavorite={() => onToggleFavorite(entry.id)}
              onRemove={() => onRemove(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryEntry({ entry, onSelect, onToggleFavorite, onRemove }) {
  const isReverse = entry.mode === 'response';

  return (
    <div className="px-4 py-3 hover:bg-white/3 group transition-colors">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleFavorite}
          className={`flex-shrink-0 text-lg leading-none mt-0.5 transition-colors ${
            entry.favorite ? 'text-gold' : 'text-gray-700 hover:text-gray-500'
          }`}
        >
          {entry.favorite ? '★' : '☆'}
        </button>

        <button
          onClick={onSelect}
          className="flex-1 text-left min-w-0"
        >
          <p className="text-gray-300 text-sm truncate">{entry.original}</p>
          {!isReverse && entry.result?.phonetic && (
            <p className="text-gold text-xs font-mono truncate mt-0.5">{entry.result.phonetic}</p>
          )}
          {!isReverse && entry.result?.arabic && (
            <p className="text-gray-600 text-xs text-right font-arabic truncate" dir="rtl">
              {entry.result.arabic}
            </p>
          )}
          {isReverse && entry.result?.spanish && (
            <p className="text-teal text-xs truncate mt-0.5">{entry.result.spanish}</p>
          )}
        </button>

        <button
          onClick={onRemove}
          className="flex-shrink-0 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
