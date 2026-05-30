import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'motocamps_kenya';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveLocal(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [userSites, setUserSites] = useState(loadLocal);
  const [synced, setSynced] = useState(false);

  // Subscribe to Firestore when logged in, merge with local data
  useEffect(() => {
    if (!user) {
      setSynced(false);
      return;
    }
    const ref = doc(db, 'users', user.uid, 'data', 'sites');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const remote = snap.data();
        setUserSites(prev => {
          const merged = { ...prev, ...remote };
          saveLocal(merged);
          return merged;
        });
      } else {
        // First ever login — push local data up to Firestore
        const local = loadLocal();
        if (Object.keys(local).length > 0) {
          setDoc(ref, local).catch(console.error);
        }
      }
      setSynced(true);
    });
    return unsub;
  }, [user]);

  const persist = useCallback((newState) => {
    saveLocal(newState);
    if (user) {
      const ref = doc(db, 'users', user.uid, 'data', 'sites');
      setDoc(ref, newState).catch(console.error);
    }
  }, [user]);

  function getSiteData(id) {
    return userSites[id] || { visited: false, planned: false, rating: 0, notes: '', visitedDate: null };
  }

  function toggleVisited(id) {
    setUserSites(prev => {
      const current = prev[id] || {};
      const wasVisited = !!current.visited;
      const next = {
        ...prev,
        [id]: {
          ...current,
          visited: !wasVisited,
          visitedDate: !wasVisited ? new Date().toISOString().split('T')[0] : null,
          planned: wasVisited ? (current.planned ?? false) : false,
        }
      };
      persist(next);
      return next;
    });
  }

  function togglePlanned(id) {
    setUserSites(prev => {
      const current = prev[id] || {};
      const next = { ...prev, [id]: { ...current, planned: !current.planned, visited: false } };
      persist(next);
      return next;
    });
  }

  function setRating(id, rating) {
    setUserSites(prev => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), rating } };
      persist(next);
      return next;
    });
  }

  function setNotes(id, notes) {
    setUserSites(prev => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), notes } };
      persist(next);
      return next;
    });
  }

  function getStats() {
    const visited = Object.values(userSites).filter(s => s.visited).length;
    const planned = Object.values(userSites).filter(s => s.planned).length;
    return { visited, planned };
  }

  return (
    <StoreContext.Provider value={{
      getSiteData, toggleVisited, togglePlanned,
      setRating, setNotes, getStats, userSites, synced
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
