import { useState } from 'react';
import { Send, Trash2, MessageSquare, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../hooks/useComments';
import StarRating from './StarRating';

function timeAgo(timestamp) {
  if (!timestamp?.seconds) return 'just now';
  const secs = Math.floor(Date.now() / 1000 - timestamp.seconds);
  if (secs < 60)   return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 86400 * 30) return `${Math.floor(secs / 86400)}d ago`;
  return new Date(timestamp.seconds * 1000).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function Avatar({ photoURL, displayName, size = 8 }) {
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  return photoURL ? (
    <img
      src={photoURL}
      alt={displayName}
      className={`w-${size} h-${size} rounded-full object-cover border border-green-800 shrink-0`}
    />
  ) : (
    <div className={`w-${size} h-${size} rounded-full bg-green-900 border border-green-700 flex items-center justify-center shrink-0 text-xs font-bold text-green-300`}>
      {initials}
    </div>
  );
}

export default function TripReports({ siteId }) {
  const { user, isAdmin, signIn } = useAuth();
  const { comments, addComment, deleteComment, loading } = useComments(siteId);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSubmitting(true);
    try {
      await addComment({
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        text,
        rating,
      });
      setText('');
      setRating(0);
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
    setSubmitting(false);
  }

  async function handleDelete(commentId) {
    if (deleteConfirm !== commentId) {
      setDeleteConfirm(commentId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    await deleteComment(commentId).catch(console.error);
    setDeleteConfirm(null);
  }

  return (
    <div className="border-t border-[#2d5a2e]/40 pt-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <MessageSquare size={13} />
        Trip Reports
        {comments.length > 0 && (
          <span className="bg-green-900/50 text-green-400 text-xs px-1.5 py-0.5 rounded-full font-normal">
            {comments.length}
          </span>
        )}
      </h2>

      {/* Submit form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <Avatar photoURL={user.photoURL} displayName={user.displayName} />
            <div className="flex-1 space-y-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Share your experience — road conditions, best spots, tips for fellow riders..."
                rows={3}
                className="w-full bg-[#1e3320] border border-[#2d5a2e] rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-green-600 resize-none transition-colors"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rate this site:</span>
                  <StarRating value={rating} onChange={setRating} size={16} />
                </div>
                <button
                  type="submit"
                  disabled={!text.trim() || submitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Send size={13} />
                  {submitting ? 'Posting…' : 'Post report'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-[#1e3320] border border-[#2d5a2e] hover:border-green-600 text-gray-400 hover:text-green-300 rounded-xl text-sm transition-colors"
        >
          <LogIn size={15} />
          Sign in with Google to share your trip report
        </button>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-6 text-gray-600 text-sm">Loading reports…</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-600 border border-[#2d5a2e]/20 rounded-xl">
          <MessageSquare size={28} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">No trip reports yet.</p>
          <p className="text-xs mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => {
            const isOwn = user?.uid === c.uid;
            const canDelete = isOwn || isAdmin;
            return (
              <div key={c.id} className="flex gap-3 group">
                <Avatar photoURL={c.photoURL} displayName={c.displayName} />
                <div className="flex-1 min-w-0">
                  <div className="bg-[#1a2e1a] rounded-xl rounded-tl-none px-4 py-3 border border-[#2d5a2e]/40">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-green-200">{c.displayName}</span>
                        {c.rating > 0 && (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`text-xs ${s <= c.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-gray-600">{timeAgo(c.createdAt)}</span>
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className={`shrink-0 p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
                            deleteConfirm === c.id
                              ? 'text-red-400 bg-red-900/30 opacity-100'
                              : 'text-gray-600 hover:text-red-400 hover:bg-red-900/20'
                          }`}
                          title={deleteConfirm === c.id ? 'Click again to confirm delete' : 'Delete report'}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
