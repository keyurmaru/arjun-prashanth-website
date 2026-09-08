-- Central Media Library: one table for every uploaded image/video, reused
-- across Films/Books via URL references (see mediaRepo.ts). External video
-- links (YouTube/Vimeo) stay in film_videos as before — this table is only
-- for actual uploaded files.
CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('image', 'video') NOT NULL,
  storage_key VARCHAR(300) NOT NULL UNIQUE,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  width INT NULL,
  height INT NULL,
  title VARCHAR(200) NULL,
  alt_text VARCHAR(300) NULL,
  caption VARCHAR(300) NULL,
  description TEXT NULL,
  seo_title VARCHAR(200) NULL,
  seo_description VARCHAR(300) NULL,
  keywords VARCHAR(300) NULL,
  credit VARCHAR(200) NULL,
  rights_owner VARCHAR(200) NULL,
  rights_status ENUM('NOT_VERIFIED', 'APPROVED_FOR_PUBLICATION', 'RESTRICTED') NOT NULL DEFAULT 'NOT_VERIFIED',
  category VARCHAR(60) NULL,
  project_tag VARCHAR(120) NULL,
  tags VARCHAR(300) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  featured_order INT NOT NULL DEFAULT 0,
  status ENUM('DRAFT', 'APPROVED', 'ARCHIVED') NOT NULL DEFAULT 'APPROVED',
  created_by INT NULL,
  updated_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_media_type_status (type, status),
  INDEX idx_media_category (category)
);

-- Multiple video "kinds" per film (trailer/teaser/BTS/interview/...) plus an
-- optional poster image for uploaded (non-YouTube/Vimeo) videos. Both
-- columns are additive and default to today's behaviour.
ALTER TABLE film_videos
  ADD COLUMN IF NOT EXISTS video_type VARCHAR(30) NOT NULL DEFAULT 'Trailer' AFTER title,
  ADD COLUMN IF NOT EXISTS poster_url VARCHAR(300) NULL AFTER video_type;

-- Books get a gallery/mockups list, mirroring film_gallery.
CREATE TABLE IF NOT EXISTS book_gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  image_url VARCHAR(300) NOT NULL,
  caption VARCHAR(200) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
