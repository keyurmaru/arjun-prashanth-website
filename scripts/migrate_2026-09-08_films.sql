-- One-time migration: add the films table (DB-backed CMS + Featured
-- system). Already applied directly to production; kept here so
-- schema.sql (fresh installs) and the live DB stay in sync.

CREATE TABLE IF NOT EXISTS films (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  project_type ENUM('Feature Film', 'Short Film', 'Direction', 'Associate Direction', 'Assistant Direction', 'Editing') NOT NULL,
  official_role VARCHAR(150) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  language VARCHAR(60) NOT NULL,
  year VARCHAR(20) NULL,
  credits TEXT NOT NULL,
  synopsis TEXT NULL,
  trailer_url VARCHAR(300) NULL,
  poster_url VARCHAR(300) NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  featured_order INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  seo_title VARCHAR(200) NULL,
  seo_description VARCHAR(300) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
