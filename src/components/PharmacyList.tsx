import type { Pharmacy, UserLocation } from '../types/pharmacy';
import { getDistanceFromUser, getGoogleMapsDirectionsUrl } from '../utils/location';

interface PharmacyListProps {
  pharmacies: Pharmacy[];
  userLocation: UserLocation | null;
  selectedPharmacy: Pharmacy | null;
  onPharmacySelect: (pharmacy: Pharmacy) => void;
}

export default function PharmacyList({ 
  pharmacies, 
  userLocation, 
  selectedPharmacy, 
  onPharmacySelect 
}: PharmacyListProps) {
  const handleGetDirections = (pharmacy: Pharmacy, e: React.MouseEvent) => {
    e.stopPropagation();
    const directionsUrl = userLocation 
      ? getGoogleMapsDirectionsUrl(userLocation, pharmacy)
      : pharmacy.mapLink;
    window.open(directionsUrl, '_blank');
  };

  const handleCallPharmacy = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${phone}`, '_self');
  };

  const handlePrintNobetKarti = (pharmacy: Pharmacy, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pharmacy.nobetKartiId) {
      window.open(`https://www.izmireczaciodasi.org.tr/${pharmacy.nobetKartiId}`, '_blank');
    }
  };

  return (
    <div className="pharmacy-list">
      <div className="list-header">
        <h2>Nöbetçi Eczaneler</h2>
        <p className="pharmacy-count">{pharmacies.length} eczane bulundu</p>
        {userLocation && (
          <p className="location-info">
            Konum algılandı - mesafeler gösteriliyor
          </p>
        )}
      </div>

      <div className="pharmacy-items">
        {pharmacies.map((pharmacy) => {
          const distance = userLocation ? getDistanceFromUser(userLocation, pharmacy) : null;
          const isSelected = selectedPharmacy?.name === pharmacy.name;

          return (
            <div
              key={`${pharmacy.name}-${pharmacy.location}`}
              className={`pharmacy-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onPharmacySelect(pharmacy)}
            >
              <div className="pharmacy-header">
                <h3>{pharmacy.name} ECZANESİ</h3>
                {distance !== null && (
                  <span className="distance">{distance} km</span>
                )}
              </div>

              <div className="pharmacy-info">
                <p className="district">
                  <span className="label">İlçe:</span> {pharmacy.district}
                </p>
                {pharmacy.address && (
                  <p className="address">
                    <span className="label">Adres:</span> {pharmacy.address}
                  </p>
                )}
                <p className="phone">
                  <span className="label">Telefon:</span> {pharmacy.phone}
                </p>
                {pharmacy.notes && (
                  <p className="notes">
                    <span className="label">Notlar:</span> {pharmacy.notes}
                  </p>
                )}
              </div>

              <div className="pharmacy-actions">
                <button
                  onClick={(e) => handleGetDirections(pharmacy, e)}
                  className="directions-btn"
                >
                  Yol Tarifi
                </button>
                <button
                  onClick={(e) => handleCallPharmacy(pharmacy.phone, e)}
                  className="call-btn"
                >
                  Ara
                </button>
                {pharmacy.nobetKartiId && (
                  <button
                    onClick={(e) => handlePrintNobetKarti(pharmacy, e)}
                    className="print-btn"
                  >
                    Nöbet Kartı
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}