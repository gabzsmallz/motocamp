import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './store/useStore';
import { RatingsProvider } from './context/RatingsContext';
import { CampsitesProvider } from './context/CampsitesContext';
import Navbar from './components/Navbar';
import InstallPrompt from './components/InstallPrompt';
import Home from './pages/Home';
import MapView from './pages/MapView';
import ListView from './pages/ListView';
import SiteDetail from './pages/SiteDetail';
import MyTrips from './pages/MyTrips';
import Suggest from './pages/Suggest';
import AdminPanel from './pages/AdminPanel';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CampsitesProvider>
          <RatingsProvider>
            <BrowserRouter>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <InstallPrompt />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/"        element={<Home />} />
                    <Route path="/map"     element={<MapView />} />
                    <Route path="/list"    element={<ListView />} />
                    <Route path="/site/:id" element={<SiteDetail />} />
                    <Route path="/trips"   element={<MyTrips />} />
                    <Route path="/suggest" element={<Suggest />} />
                    <Route path="/admin"   element={<AdminPanel />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </RatingsProvider>
        </CampsitesProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
