import { useState, useCallback } from 'react';

const STORAGE_KEY = 'trabibi_history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useHistory() {
  const [history, setHistory] = useState(loadHistory);

  const addEntry = useCallback((entry) => {
    setHistory((prev) => {
      const updated = [
        { ...entry, id: Date.now(), favorite: false, savedAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 200);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, favorite: !e.favorite } : e
      );
      saveHistory(updated);
      return updated;
    });
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addEntry, toggleFavorite, removeEntry, clearHistory };
}
