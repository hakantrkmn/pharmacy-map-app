import type { UserLocation, Pharmacy } from '../types/pharmacy';

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get user's current location
export function getUserLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  });
}

// Calculate distance from user location to pharmacy
export function getDistanceFromUser(
  userLocation: UserLocation,
  pharmacy: Pharmacy
): number | null {
  if (!pharmacy.coordinates) return null;
  
  return calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    pharmacy.coordinates.latitude,
    pharmacy.coordinates.longitude
  );
}

// Sort pharmacies by distance from user location
export function sortPharmaciesByDistance(
  pharmacies: Pharmacy[],
  userLocation: UserLocation
): Pharmacy[] {
  return pharmacies
    .map((pharmacy) => ({
      ...pharmacy,
      distance: getDistanceFromUser(userLocation, pharmacy),
    }))
    .sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
}

// Generate Google Maps directions URL
export function getGoogleMapsDirectionsUrl(
  userLocation: UserLocation,
  pharmacy: Pharmacy
): string {
  if (!pharmacy.coordinates) return pharmacy.mapLink;
  
  const origin = `${userLocation.latitude},${userLocation.longitude}`;
  const destination = `${pharmacy.coordinates.latitude},${pharmacy.coordinates.longitude}`;
  
  return `https://www.google.com/maps/dir/${origin}/${destination}`;
}