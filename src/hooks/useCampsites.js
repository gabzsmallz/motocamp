import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { campsites as staticCampsites } from '../data/campsites';

/**
 * Merges static seed campsites with community-approved campsites from Firestore.
 * Static sites always come first (ids 1–999).
 * Firestore community sites have string ids (Firestore auto-ids).
 */
export function useCampsites() {
  const [firestoreSites, setFirestoreSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, 'campsites');
    const unsub = onSnapshot(ref, (snap) => {
      const sites = snap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,           // Firestore string id
        community: true,      // flag to distinguish from static
      }));
      setFirestoreSites(sites);
      setLoading(false);
    }, () => {
      // Firestore unavailable (offline/rules) — gracefully degrade to static only
      setLoading(false);
    });
    return unsub;
  }, []);

  return {
    campsites: [...staticCampsites, ...firestoreSites],
    loading,
  };
}
