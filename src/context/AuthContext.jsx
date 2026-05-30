import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider, ADMIN_EMAIL } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  async function signIn() {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  }

  async function signOutUser() {
    await signOut(auth);
  }

  const isAdmin = user?.email === ADMIN_EMAIL;
  const loading = user === undefined;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
