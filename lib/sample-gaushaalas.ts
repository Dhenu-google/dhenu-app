/**
 * Sample data for Gaushaalas
 * This data is for testing purposes only and should be replaced with real data from Firebase
 */

export interface Gaushaala {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  phone?: string;
  cowBreed?: string;
  distanceKm?: number;
}

export const sampleGaushaalas: Gaushaala[] = [
  {
    id: '1',
    name: 'Stanza Living Batumi House',
    address: 'Anjaneya Temple Road, Channasandra, Sri Sathya Sai Layout',
    latitude: 12.9716,
    longitude: 77.5946,
    type: 'Gaushaala',
    phone: '+919876543210',
    distanceKm: 2
  },
  {
    id: '2',
    name: 'Yuvaka Sangha',
    address: '11th Main Road, 4th T Block East, 4th Block, Jayanagar',
    latitude: 12.9516,
    longitude: 77.6146,
    type: 'Gaushaala',
    phone: '+919876543211',
    cowBreed: 'Gir',
    distanceKm: 4
  },
  {
    id: '3',
    name: 'IISC Bangalore',
    address: 'Gulmohar Marg, Mathikere, Bengaluru, Karnataka',
    latitude: 13.0219,
    longitude: 77.5671,
    type: 'Gaushaala',
    phone: '+919876543212',
    cowBreed: 'Sahiwal',
    distanceKm: 7
  },
  {
    id: '4',
    name: 'SJB Institute of Technology',
    address: 'No.67, BGS Health & Education City, BGS Goshala',
    latitude: 12.9048,
    longitude: 77.5097,
    type: 'Gaushaala',
    phone: '+919876543213',
    cowBreed: 'Hallikar',
    distanceKm: 9.2
  }
]; 