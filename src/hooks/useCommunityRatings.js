import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Subscribes to all community ratings in Firestore.
 * Returns a map: { [siteId]: { average: 4.2, count: 7 } }
 */
export function useCommunityRatings() {
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const ref = collection(db, 'ratings');
    const unsub = onSnapshot(ref, (snap) => {
      const result = {};
      snap.docs.forEach(doc => {
        const data = doc.data(); // { uid1: 4, uid2: 3, ... }
        const values = Object.values(data).filter(v => typeof v === 'number' && v > 0);
        if (values.length > 0) {
          const total = values.reduce((a, b) => a + b, 0);
          result[doc.id] = {
            average: Math.round((total / values.length) * 10) / 10,
            count: values.length,
          };
        }
      });
      setRatings(result);
    });
    return unsub;
  }, []);

  return ratings;
}
