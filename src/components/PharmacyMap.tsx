import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import type { Pharmacy, UserLocation } from '../types/pharmacy';
import { getGoogleMapsDirectionsUrl } from '../utils/location';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
delete (Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  userLocation: UserLocation | null;
  selectedPharmacy: Pharmacy | null;
  onPharmacySelect: (pharmacy: Pharmacy) => void;
  key?: string; // Add key prop to force re-render when pharmacies change
}


export default function PharmacyMap({ 
  pharmacies, 
  userLocation, 
  selectedPharmacy, 
  onPharmacySelect 
}: PharmacyMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([38.4237, 27.1428]); // İzmir merkez
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(12);
    }
  }, [userLocation]);

  // Custom icons
  const userIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const pharmacyIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const selectedPharmacyIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="user-popup">
                <h3>Your Location</h3>
                <p>Lat: {userLocation.latitude.toFixed(6)}</p>
                <p>Lng: {userLocation.longitude.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pharmacy markers */}
        {pharmacies.map((pharmacy) => {
          if (!pharmacy.coordinates) return null;

          const isSelected = selectedPharmacy?.name === pharmacy.name;
          const directionsUrl = userLocation 
            ? getGoogleMapsDirectionsUrl(userLocation, pharmacy)
            : pharmacy.mapLink;

          return (
            <Marker
              key={`${pharmacy.name}-${pharmacy.location}`}
              position={[pharmacy.coordinates.latitude, pharmacy.coordinates.longitude]}
              icon={isSelected ? selectedPharmacyIcon : pharmacyIcon}
              eventHandlers={{
                click: () => onPharmacySelect(pharmacy),
              }}
            >
              <Popup>
                <div className="pharmacy-popup">
                  <h3>{pharmacy.name} ECZANESİ</h3>
                  <p><strong>Bölge:</strong> {pharmacy.location}</p>
                  <p><strong>Telefon:</strong> {pharmacy.phone}</p>
                  {pharmacy.notes && <p><strong>Notlar:</strong> {pharmacy.notes}</p>}
                  
                  <div className="popup-actions">
                    <button
                      onClick={() => window.open(directionsUrl, '_blank')}
                      className="directions-btn"
                    >
                      Yol Tarifi
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}