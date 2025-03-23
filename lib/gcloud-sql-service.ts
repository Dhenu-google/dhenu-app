/**
 * Google Cloud SQL service module.
 * Provides methods for interacting with Google Cloud SQL database.
 */

import { Gaushaala } from './sample-gaushaalas';

// API base URL
const API_BASE_URL = 'https://your-api-endpoint.com';

/**
 * Fetch all gaushaalas from Google Cloud SQL
 * @returns {Promise<Gaushaala[]>} List of gaushaalas
 */
export const fetchGaushaalas = async (): Promise<Gaushaala[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gaushaalas`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the data to match our interface
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      address: item.address,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      type: item.type || 'Gaushaala',
      phone: item.phone,
      cowBreed: item.cow_breed,
      distanceKm: parseFloat(item.distance_km) || null
    }));
  } catch (error) {
    console.error('Error fetching gaushaalas:', error);
    throw error;
  }
};

/**
 * Fetch gaushaalas filtered by distance
 * @param {number} maxDistance - Maximum distance in kilometers
 * @returns {Promise<Gaushaala[]>} Filtered list of gaushaalas
 */
export const fetchGaushaalasByDistance = async (maxDistance: number): Promise<Gaushaala[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gaushaalas/distance/${maxDistance}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      address: item.address,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      type: item.type || 'Gaushaala',
      phone: item.phone,
      cowBreed: item.cow_breed,
      distanceKm: parseFloat(item.distance_km) || null
    }));
  } catch (error) {
    console.error(`Error fetching gaushaalas within ${maxDistance}km:`, error);
    throw error;
  }
};

/**
 * Fetch gaushaalas filtered by cow breed
 * @param {string} breed - Cow breed to filter by
 * @returns {Promise<Gaushaala[]>} Filtered list of gaushaalas
 */
export const fetchGaushaalasByBreed = async (breed: string): Promise<Gaushaala[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gaushaalas/breed/${encodeURIComponent(breed)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      address: item.address,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      type: item.type || 'Gaushaala',
      phone: item.phone,
      cowBreed: item.cow_breed,
      distanceKm: parseFloat(item.distance_km) || null
    }));
  } catch (error) {
    console.error(`Error fetching gaushaalas with breed ${breed}:`, error);
    throw error;
  }
}; 