/**
 * API route for gaushaalas data
 * This is a sample backend API that would connect to Google Cloud SQL
 */

// Example using Express.js
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Google Cloud SQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // For Google Cloud SQL, you might need additional connection options
  socketPath: process.env.INSTANCE_CONNECTION_NAME
    ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
    : undefined
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

/**
 * GET /api/gaushaalas
 * Retrieve all gaushaalas
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        address, 
        latitude, 
        longitude, 
        type, 
        phone, 
        cow_breed AS cowBreed, 
        distance_km AS distanceKm 
      FROM gaushaalas
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gaushaalas:', error);
    res.status(500).json({ error: 'Failed to fetch gaushaalas' });
  }
});

/**
 * GET /api/gaushaalas/distance/:maxDistance
 * Retrieve gaushaalas within a certain distance
 */
router.get('/distance/:maxDistance', async (req, res) => {
  try {
    const maxDistance = parseFloat(req.params.maxDistance);
    
    if (isNaN(maxDistance)) {
      return res.status(400).json({ error: 'Invalid distance parameter' });
    }
    
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        address, 
        latitude, 
        longitude, 
        type, 
        phone, 
        cow_breed AS cowBreed, 
        distance_km AS distanceKm 
      FROM gaushaalas
      WHERE distance_km <= ?
    `, [maxDistance]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gaushaalas by distance:', error);
    res.status(500).json({ error: 'Failed to fetch gaushaalas by distance' });
  }
});

/**
 * GET /api/gaushaalas/breed/:breed
 * Retrieve gaushaalas that have a specific cow breed
 */
router.get('/breed/:breed', async (req, res) => {
  try {
    const breed = req.params.breed;
    
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        address, 
        latitude, 
        longitude, 
        type, 
        phone, 
        cow_breed AS cowBreed, 
        distance_km AS distanceKm 
      FROM gaushaalas
      WHERE cow_breed LIKE ?
    `, [`%${breed}%`]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gaushaalas by breed:', error);
    res.status(500).json({ error: 'Failed to fetch gaushaalas by breed' });
  }
});

module.exports = router; 