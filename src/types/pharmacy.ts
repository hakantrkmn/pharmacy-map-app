export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Pharmacy {
  name: string;
  location: string;
  address: string;
  phone: string;
  notes: string;
  coordinates: Coordinates | null;
  mapLink: string;
  extractedAt: string;
}

export interface PharmacyData {
  extractedAt: string;
  totalPharmacies: number;
  pharmacies: Pharmacy[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}