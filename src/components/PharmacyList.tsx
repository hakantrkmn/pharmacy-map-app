import React from 'react';
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
    <section className="pharmacy-list" itemScope itemType="https://schema.org/ItemList">
      <header className="list-header">
        <h2>Nöbetçi Eczaneler</h2>
        <p className="pharmacy-count" itemProp="numberOfItems">{pharmacies.length} eczane bulundu</p>
        {userLocation && (
          <p className="location-info">
            Konum algılandı - mesafeler gösteriliyor
          </p>
        )}
      </header>

      <div className="pharmacy-items">
        {pharmacies.map((pharmacy) => {
          const distance = userLocation ? getDistanceFromUser(userLocation, pharmacy) : null;
          const isSelected = selectedPharmacy?.name === pharmacy.name;

          return (
            <article
              key={`${pharmacy.name}-${pharmacy.location}`}
              className={`pharmacy-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onPharmacySelect(pharmacy)}
              itemScope
              itemType="https://schema.org/Pharmacy"
              itemProp="itemListElement"
            >
              <header className="pharmacy-header">
                <h3 itemProp="name">{pharmacy.name} ECZANESİ</h3>
                {distance !== null && (
                  <span className="distance">{distance} km</span>
                )}
              </header>

              <div className="pharmacy-info">
                <p className="district">
                  <span className="label">İlçe:</span> 
                  <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    <span itemProp="addressLocality">{pharmacy.district}</span>
                  </span>
                </p>
                {pharmacy.address && (
                  <p className="address">
                    <span className="label">Adres:</span> 
                    <span itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                      <span itemProp="streetAddress">{pharmacy.address}</span>
                    </span>
                  </p>
                )}
                <p className="phone">
                  <span className="label">Telefon:</span> 
                  <span itemProp="telephone">{pharmacy.phone}</span>
                </p>
                {pharmacy.notes && (
                  <p className="notes">
                    <span className="label">Notlar:</span> 
                    <span itemProp="description">{pharmacy.notes}</span>
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
            </article>
          );
        })}
      </div>
    </section>
  );
}