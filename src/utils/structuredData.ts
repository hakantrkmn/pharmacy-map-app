import type { Pharmacy } from '../types/pharmacy';

/**
 * Generate structured data for the main application
 */
export function generateMainStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "İzmir Nöbetçi Eczane",
    "description": "İzmir'deki güncel nöbetçi eczane listesi ve harita uygulaması",
    "url": "https://izmir-nobetci-eczane.vercel.app",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    },
    "provider": {
      "@type": "Organization",
      "name": "İzmir Nöbetçi Eczane",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "İzmir",
        "addressRegion": "İzmir",
        "addressCountry": "TR"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": "İzmir",
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": "İzmir"
      }
    }
  };
}

/**
 * Generate structured data for a single pharmacy
 */
export function generatePharmacyStructuredData(pharmacy: Pharmacy) {
  const baseData = {
    "@type": "Pharmacy",
    "name": `${pharmacy.name} ECZANESİ`,
    "description": `İzmir ${pharmacy.district} ilçesinde bulunan nöbetçi eczane`,
    "telephone": pharmacy.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": pharmacy.address,
      "addressLocality": pharmacy.district,
      "addressRegion": "İzmir",
      "addressCountry": "TR"
    },
    "geo": pharmacy.coordinates ? {
      "@type": "GeoCoordinates",
      "latitude": pharmacy.coordinates.latitude,
      "longitude": pharmacy.coordinates.longitude
    } : undefined,
    "url": pharmacy.mapLink,
    "openingHours": "24/7", // Nöbetçi eczaneler 24 saat açık
    "medicalSpecialty": "Pharmacy",
    "serviceType": "Nöbetçi Eczane Hizmeti"
  };

  // Remove undefined geo if coordinates are not available
  if (!pharmacy.coordinates) {
    delete baseData.geo;
  }

  return baseData;
}

/**
 * Generate ItemList structured data for the pharmacy list
 */
export function generatePharmacyListStructuredData(pharmacies: Pharmacy[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "İzmir Nöbetçi Eczaneler Listesi",
    "description": "İzmir'deki güncel nöbetçi eczane listesi",
    "numberOfItems": pharmacies.length,
    "itemListElement": pharmacies.map((pharmacy, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": generatePharmacyStructuredData(pharmacy)
    }))
  };
}

/**
 * Generate comprehensive structured data combining all schemas
 */
export function generateComprehensiveStructuredData(pharmacies: Pharmacy[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      generateMainStructuredData(),
      generatePharmacyListStructuredData(pharmacies),
      ...pharmacies.map(pharmacy => generatePharmacyStructuredData(pharmacy))
    ]
  };
}

/**
 * Inject structured data into the document head
 */
export function injectStructuredData(data: any) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  
  // Add to head
  document.head.appendChild(script);
}

/**
 * Update structured data when pharmacy data changes
 */
export function updateStructuredData(pharmacies: Pharmacy[]) {
  if (pharmacies.length > 0) {
    const structuredData = generateComprehensiveStructuredData(pharmacies);
    injectStructuredData(structuredData);
  }
}
