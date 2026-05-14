import { useState } from 'react';
import TranslatorInput from './components/TranslatorInput';
import TranslationCard from './components/TranslationCard';
import HistoryPanel from './components/HistoryPanel';
import ModeToggle from './components/ModeToggle';
import { translateToArabic, translateFromArabic } from './services/claudeApi';
import { useHistory } from './hooks/useHistory';

export default function App() {
  const [mode, setMode] = useState('translate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { history, addEntry, toggleFavorite, removeEntry, clearHistory } = useHistory();

  const handleTranslate = async (phrase) => {
    setIsLoading(true);
    setError(null);
    setIsSaved(false);
    setCurrentPhrase(phrase);
    setCurrentResult(null);

    try {
      const result =
        mode === 'response'
          ? await translateFromArabic(phrase)
          : await translateToArabic(phrase);
      setCurrentResult(result);
    } catch (err) {
      setError(err.message || 'Error al traducir. Revisá tu conexión o clave API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!currentResult) return;
    addEntry({
      original: currentPhrase,
      result: currentResult,
      category: currentResult.category || 'other',
      mode,
    });
    setIsSaved(true);
  };

  const handleSelectHistory = (entry) => {
    setMode(entry.mode || 'translate');
    setCurrentPhrase(entry.original);
    setCurrentResult(entry.result);
    setIsSaved(true);
    setError(null);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentResult(null);
    setCurrentPhrase('');
    setError(null);
    setIsSaved(false);
  };

  return (
    <div className="min-h-screen bg-darkbg text-white flex flex-col lg:flex-row">
      {/* Main column */}
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full lg:max-w-none lg:mx-0 px-4 pb-8 pt-6 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gold tracking-tight flex items-center gap-2">
              <span className="text-3xl">☽</span>
              Trabibi
            </h1>
            <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}>
              تعبيري · Árabe Egipcio
            </p>
          </div>

          {/* History toggle (mobile) */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 bg-surface border border-white/10 rounded-full text-sm text-gray-400 hover:text-white transition-colors lg:hidden"
          >
            <span>📚</span>
            <span>Historial</span>
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold rounded-full text-[10px] text-darkbg font-bold flex items-center justify-center">
                {history.length > 99 ? '99+' : history.length}
              </span>
            )}
          </button>
        </header>

        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <ModeToggle mode={mode} onChange={handleModeChange} />
        </div>

        {/* Input */}
        <TranslatorInput
          onTranslate={handleTranslate}
          isLoading={isLoading}
          mode={mode}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mt-6 bg-surface border border-white/10 rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded-full w-3/4" />
            <div className="h-12 bg-gold/10 rounded-2xl" />
            <div className="h-8 bg-white/10 rounded-full w-1/2 mx-auto" />
            <div className="h-4 bg-white/10 rounded-full w-2/3 mx-auto" />
          </div>
        )}

        {/* Result */}
        {!isLoading && currentResult && (
          <div className="mt-6">
            <TranslationCard
              result={currentResult}
              originalPhrase={currentPhrase}
              onSave={handleSave}
              isSaved={isSaved}
              mode={mode}
            />
          </div>
        )}
      </main>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-l border-white/10 h-screen sticky top-0">
        <HistoryPanel
          history={history}
          onSelect={handleSelectHistory}
          onToggleFavorite={toggleFavorite}
          onRemove={removeEntry}
          onClear={clearHistory}
          isOpen={true}
          onClose={() => {}}
        />
      </aside>

      {/* Mobile history bottom sheet */}
      <div className="lg:hidden">
        <HistoryPanel
          history={history}
          onSelect={handleSelectHistory}
          onToggleFavorite={toggleFavorite}
          onRemove={removeEntry}
          onClear={clearHistory}
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </div>
  );
}
