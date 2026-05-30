import { createContext, useContext } from 'react';
import { useCommunityRatings } from '../hooks/useCommunityRatings';

const RatingsContext = createContext({});

export function RatingsProvider({ children }) {
  const ratings = useCommunityRatings();
  return (
    <RatingsContext.Provider value={ratings}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  return useContext(RatingsContext);
}
