import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Subscribes to comments for a single campsite.
 * Returns { comments, addComment, deleteComment, loading }
 */
export function useComments(siteId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) return;
    const ref = collection(db, 'comments', String(siteId), 'posts');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [siteId]);

  async function addComment({ uid, displayName, photoURL, text, rating }) {
    const ref = collection(db, 'comments', String(siteId), 'posts');
    await addDoc(ref, {
      uid,
      displayName,
      photoURL: photoURL || null,
      text: text.trim(),
      rating: rating || 0,
      createdAt: serverTimestamp(),
    });
  }

  async function deleteComment(commentId) {
    const ref = doc(db, 'comments', String(siteId), 'posts', commentId);
    await deleteDoc(ref);
  }

  return { comments, addComment, deleteComment, loading };
}
