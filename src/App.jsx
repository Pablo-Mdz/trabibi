import { useState } from 'react';
import TranslatorInput from './components/TranslatorInput';
import TranslationCard from './components/TranslationCard';
import HistoryPanel from './components/HistoryPanel';
import ModeToggle from './components/ModeToggle';
import PhrasesPanel from './components/PhrasesPanel';
import { translateToArabic, translateFromArabic } from './services/claudeApi';
import { useHistory } from './hooks/useHistory';

// Tabs for the bottom section
const TABS = [
  { id: 'frases', label: '📚 Frases' },
  { id: 'historial', label: '🕓 Historial' },
];

export default function App() {
  const [mode, setMode] = useState('translate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('frases');
  const [mobileBottomOpen, setMobileBottomOpen] = useState(false);

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

  // Tap a pre-loaded phrase from PhrasesPanel → show its card directly (no API call)
  const handleSelectPreloadedPhrase = (phrase) => {
    setMode('translate');
    setCurrentPhrase(phrase.es);
    setCurrentResult({
      arabic: phrase.arabic,
      phonetic: phrase.phonetic,
      literal: phrase.es,
      tips: phrase.tip || null,
      category: 'other',
    });
    setIsSaved(false);
    setError(null);
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* ── Main column ── */}
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full lg:max-w-none lg:mx-0 px-4 pb-4 pt-6 lg:overflow-y-auto">

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

          {/* Mobile: toggle bottom panel */}
          <button
            onClick={() => setMobileBottomOpen(v => !v)}
            className="relative flex items-center gap-2 px-3 py-2 bg-surface border border-white/10 rounded-full text-sm text-gray-400 hover:text-white transition-colors lg:hidden"
          >
            <span>{mobileBottomOpen ? '✕' : '📚'}</span>
            <span>{mobileBottomOpen ? 'Cerrar' : 'Frases'}</span>
            {history.length > 0 && !mobileBottomOpen && (
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

        {/* Translation result */}
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

        {/* Mobile: inline bottom panel (frases + historial) */}
        {mobileBottomOpen && (
          <div className="mt-6 lg:hidden">
            <BottomPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              history={history}
              onSelectPhrase={handleSelectPreloadedPhrase}
              onSelectHistory={(e) => { handleSelectHistory(e); setMobileBottomOpen(false); }}
              onToggleFavorite={toggleFavorite}
              onRemove={removeEntry}
              onClear={clearHistory}
            />
          </div>
        )}

        <div className="pb-8" />
      </main>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex lg:w-96 xl:w-[420px] flex-col border-l border-white/10 h-screen sticky top-0">
        <div className="flex border-b border-white/10 flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'frases' ? (
            <div className="p-4">
              <PhrasesPanel onSelectPhrase={handleSelectPreloadedPhrase} />
            </div>
          ) : (
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onToggleFavorite={toggleFavorite}
              onRemove={removeEntry}
              onClear={clearHistory}
              isOpen={true}
              onClose={() => {}}
              embedded
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function BottomPanel({ activeTab, setActiveTab, history, onSelectPhrase, onSelectHistory, onToggleFavorite, onRemove, onClear }) {
  return (
    <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden">
      <div className="flex border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-gold border-b-2 border-gold'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-4">
        {activeTab === 'frases' ? (
          <PhrasesPanel onSelectPhrase={onSelectPhrase} />
        ) : (
          <HistoryPanel
            history={history}
            onSelect={onSelectHistory}
            onToggleFavorite={onToggleFavorite}
            onRemove={onRemove}
            onClear={onClear}
            isOpen={true}
            onClose={() => {}}
            embedded
          />
        )}
      </div>
    </div>
  );
}
