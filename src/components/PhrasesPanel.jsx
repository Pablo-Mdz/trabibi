import { useState } from 'react';
import { PHRASE_CATEGORIES, NUMBERS_DATA } from '../data/phrases';
import AudioButton from './AudioButton';

const COLOR_MAP = {
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  blue:    'border-blue-500/30 bg-blue-500/10 text-blue-400',
  pink:    'border-pink-500/30 bg-pink-500/10 text-pink-400',
  yellow:  'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  teal:    'border-teal/30 bg-teal/10 text-teal',
  purple:  'border-purple-500/30 bg-purple-500/10 text-purple-400',
  orange:  'border-orange-500/30 bg-orange-500/10 text-orange-400',
  red:     'border-red-500/30 bg-red-500/10 text-red-400',
};

const COLOR_DOT = {
  emerald: 'bg-emerald-400',
  blue:    'bg-blue-400',
  pink:    'bg-pink-400',
  yellow:  'bg-yellow-400',
  teal:    'bg-teal',
  purple:  'bg-purple-400',
  orange:  'bg-orange-400',
  red:     'bg-red-400',
};

export default function PhrasesPanel({ onSelectPhrase }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">📚 Mis frases de clase</p>

      {/* Category accordions */}
      {PHRASE_CATEGORIES.map(cat => (
        <CategoryAccordion
          key={cat.id}
          cat={cat}
          isOpen={openId === cat.id}
          onToggle={() => toggle(cat.id)}
          onSelectPhrase={onSelectPhrase}
          colorClass={COLOR_MAP[cat.color]}
          dotClass={COLOR_DOT[cat.color]}
        />
      ))}

      {/* Numbers — special section */}
      <NumbersAccordion
        isOpen={openId === 'numeros'}
        onToggle={() => toggle('numeros')}
      />
    </div>
  );
}

function CategoryAccordion({ cat, isOpen, onToggle, onSelectPhrase, colorClass, dotClass }) {
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200 ${colorClass}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.emoji}</span>
          <span className="font-semibold text-sm">{cat.label}</span>
          <span className="text-xs opacity-60">({cat.phrases.length})</span>
        </div>
        <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Phrases list */}
      {isOpen && (
        <div className="border-t border-white/10 divide-y divide-white/5">
          {cat.phrases.map((phrase, i) => (
            <PhraseRow
              key={i}
              phrase={phrase}
              dotClass={dotClass}
              onSelect={() => onSelectPhrase(phrase)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PhraseRow({ phrase, dotClass, onSelect }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />

      <div className="flex-1 min-w-0">
        <p className="text-gray-300 text-sm leading-tight">{phrase.es}</p>
        <p className="text-white font-bold text-base tracking-wide mt-0.5">{phrase.phonetic}</p>
        <p
          className="text-gray-500 text-xs text-right mt-0.5 font-arabic"
          dir="rtl"
          style={{ fontFamily: "'Noto Sans Arabic', sans-serif" }}
        >
          {phrase.arabic}
        </p>
        {phrase.tip && (
          <p className="text-yellow-500/80 text-xs mt-1 flex items-start gap-1">
            <span>🌙</span>{phrase.tip}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <AudioButton arabicText={phrase.arabic} className="!px-2 !py-1 !text-xs" />
        <button
          onClick={onSelect}
          className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white text-xs transition-all"
          title="Traducir con Claude"
        >
          ↗
        </button>
      </div>
    </div>
  );
}

function NumbersAccordion({ isOpen, onToggle }) {
  const [activeTab, setActiveTab] = useState('units');

  const tabs = [
    { id: 'units',     label: '0–10' },
    { id: 'teens',     label: '11–19' },
    { id: 'tens',      label: '20–100' },
    { id: 'hundreds',  label: '100–1K' },
    { id: 'thousands', label: '1K–10K' },
    { id: 'rules',     label: 'Reglas' },
  ];

  const rows = NUMBERS_DATA[activeTab];

  return (
    <div className="rounded-2xl border border-gold/30 bg-gold/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🔢</span>
          <span className="font-semibold text-sm text-gold">Números</span>
          <span className="text-xs text-gold/60">(0 – 10.000)</span>
        </div>
        <span className={`text-gold text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="border-t border-white/10">
          {/* Tab bar */}
          <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-hide border-b border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold text-darkbg font-bold'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Rules tab */}
          {activeTab === 'rules' ? (
            <div className="px-4 py-3 flex flex-col gap-3">
              {NUMBERS_DATA.rules.map((r, i) => (
                <div key={i} className="bg-black/20 rounded-xl p-3">
                  <p className="text-gold text-xs font-bold mb-1">{r.rule}</p>
                  <p className="text-gray-300 text-sm">{r.pattern}</p>
                  <p className="text-white font-mono text-base font-bold mt-1">{r.example}</p>
                </div>
              ))}
            </div>
          ) : (
            /* Number grid */
            <div className="grid grid-cols-2 gap-px bg-white/5 p-px">
              {rows.map((row, i) => (
                <div key={i} className="bg-darkbg px-4 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-gold font-bold text-lg w-14 flex-shrink-0">
                    {row.n.toLocaleString()}
                  </span>
                  <span className="text-white font-bold text-sm text-right">{row.phonetic}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
