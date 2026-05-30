import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './store/useStore';
import { RatingsProvider } from './context/RatingsContext';
import { CampsitesProvider } from './context/CampsitesContext';
import Navbar from './components/Navbar';
import MapView from './pages/MapView';
import ListView from './pages/ListView';
import SiteDetail from './pages/SiteDetail';
import MyTrips from './pages/MyTrips';
import Suggest from './pages/Suggest';
import AdminPanel from './pages/AdminPanel';
import 'leaflet/dist/leaflet.css';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CampsitesProvider>
        <RatingsProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<MapView />} />
                <Route path="/list" element={<ListView />} />
                <Route path="/site/:id" element={<SiteDetail />} />
                <Route path="/trips" element={<MyTrips />} />
                <Route path="/suggest" element={<Suggest />} />
                <Route path="/admin" element={<AdminPanel />} />
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
