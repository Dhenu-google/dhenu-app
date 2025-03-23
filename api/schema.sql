-- Schema for Gaushaalas database

-- Create gaushaalas table
CREATE TABLE IF NOT EXISTS gaushaalas (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  type VARCHAR(100) DEFAULT 'Gaushaala',
  phone VARCHAR(20),
  cow_breed VARCHAR(100),
  distance_km DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Sample data for testing
INSERT INTO gaushaalas (name, address, latitude, longitude, type, phone, cow_breed, distance_km)
VALUES 
  ('Stanza Living Batumi House', 'Anjaneya Temple Road, Channasandra, Sri Sathya Sai Layout', 12.9716, 77.5946, 'Gaushaala', '+919876543210', NULL, 2),
  ('Yuvaka Sangha', '11th Main Road, 4th T Block East, 4th Block, Jayanagar', 12.9516, 77.6146, 'Gaushaala', '+919876543211', 'Gir', 4),
  ('IISC Bangalore', 'Gulmohar Marg, Mathikere, Bengaluru, Karnataka', 13.0219, 77.5671, 'Gaushaala', '+919876543212', 'Sahiwal', 7),
  ('SJB Institute of Technology', 'No.67, BGS Health & Education City, BGS Goshala', 12.9048, 77.5097, 'Gaushaala', '+919876543213', 'Hallikar', 9.2);

-- Create index for faster location-based queries
CREATE INDEX idx_location ON gaushaalas (latitude, longitude);

-- Create index for distance queries
CREATE INDEX idx_distance ON gaushaalas (distance_km);

-- Create index for cow breed queries
CREATE INDEX idx_cow_breed ON gaushaalas (cow_breed); 