import { useState, useEffect } from 'react';
import type { Pharmacy, UserLocation } from './types/pharmacy';
import { getUserLocation, sortPharmaciesByDistance } from './utils/location';
import PharmacyMap from './components/PharmacyMap';
import PharmacyList from './components/PharmacyList';
import DatePicker from './components/DatePicker';
import './App.css';
import { Analytics } from "@vercel/analytics/react"

function App() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Load pharmacy data from backend API with Redis caching
  useEffect(() => {
    const loadPharmacyData = async (date: string) => {
      try {
        setLoading(true);
        setDataError(null);
        setSelectedPharmacy(null); // Clear selected pharmacy when date changes
        
        // Fetch data from backend API (which handles Redis caching)
        const apiUrl = import.meta.env.DEV 
          ? `http://localhost:3001/api/pharmacies?date=${date}`
          : `/api/pharmacies?date=${date}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setPharmacies(result.data);
        
        // Log cache status
        if (result.cached) {
          console.log(`Data loaded from Redis cache for date: ${date}`);
        } else {
          console.log(`Data fetched from website and cached in Redis for date: ${date}`);
        }
      } catch (error) {
        console.error('Error loading pharmacy data:', error);
        setDataError('Failed to load pharmacy data from backend API');
      } finally {
        setLoading(false);
      }
    };

    loadPharmacyData(selectedDate);
  }, [selectedDate]);

  // Set document title
  useEffect(() => {
    document.title = 'İzmir Nöbetçi Eczane - Güncel Nöbetçi Eczane Listesi';
  }, []);

  // Get user location
  useEffect(() => {
    const getUserPosition = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        setLocationError(null);
      } catch (error) {
        console.error('Error getting user location:', error);
        setLocationError('Unable to get your location');
      }
    };

    getUserPosition();
  }, []);

  // Sort pharmacies by distance when user location is available
  const sortedPharmacies = userLocation 
    ? sortPharmaciesByDistance(pharmacies, userLocation)
    : pharmacies;

  const handlePharmacySelect = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
  };

  const handleLocationRefresh = async () => {
    setLocationError(null);
    try {
      const location = await getUserLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error refreshing user location:', error);
      setLocationError('Unable to get your location');
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  if (loading && pharmacies.length === 0) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <h1>Nöbetçi Eczaneler</h1>
          <p>Eczane verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="app error">
        <div className="error-message">
          <h1>Pharmacy Finder</h1>
          <p>{dataError}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Analytics />
      <header className="app-header">
        <h1>Nöbetçi Eczaneler</h1>
        <div className="location-status">
          {userLocation ? (
            <div className="location-success">
              <span className="location-icon">📍</span>
              <span>Konum algılandı</span>
              <button onClick={handleLocationRefresh} className="refresh-btn">
                Yenile
              </button>
            </div>
          ) : (
            <div className="location-error">
              <span className="location-icon">❌</span>
              <span>{locationError || 'Konum mevcut değil'}</span>
              <button onClick={handleLocationRefresh} className="refresh-btn">
                Tekrar Dene
              </button>
            </div>
          )}
        </div>
      </header>

      <DatePicker
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        loading={loading}
      />

      <main className="app-main">
        <div className="map-section">
          <PharmacyMap
            key={`map-${selectedDate}-${pharmacies.length}`}
            pharmacies={sortedPharmacies}
            userLocation={userLocation}
            selectedPharmacy={selectedPharmacy}
            onPharmacySelect={handlePharmacySelect}
          />
        </div>

        <div className="list-section">
          <PharmacyList
            pharmacies={sortedPharmacies}
            userLocation={userLocation}
            selectedPharmacy={selectedPharmacy}
            onPharmacySelect={handlePharmacySelect}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Veri güncellendi: {pharmacies.length > 0 ? new Date(pharmacies[0].extractedAt).toLocaleDateString('tr-TR') : 'N/A'}
        </p>
      </footer>
    </div>
  );
}


export default App;
