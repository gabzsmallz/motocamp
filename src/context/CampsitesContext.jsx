import { createContext, useContext } from 'react';
import { useCampsites } from '../hooks/useCampsites';

const CampsitesContext = createContext({ campsites: [], loading: true });

export function CampsitesProvider({ children }) {
  const value = useCampsites();
  return (
    <CampsitesContext.Provider value={value}>
      {children}
    </CampsitesContext.Provider>
  );
}

export function useCampsitesContext() {
  return useContext(CampsitesContext);
}
