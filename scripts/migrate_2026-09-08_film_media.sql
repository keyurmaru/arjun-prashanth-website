-- One-time migration: support multiple images and videos per film,
-- separate from the single card poster_url. Already applied directly to
-- production; kept here so schema.sql (fresh installs) and the live DB
-- stay in sync.

CREATE TABLE IF NOT EXISTS film_gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  film_id INT NOT NULL,
  image_url VARCHAR(300) NOT NULL,
  caption VARCHAR(200) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS film_videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  film_id INT NOT NULL,
  video_url VARCHAR(300) NOT NULL,
  title VARCHAR(200) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE
);

-- Carry forward any existing single trailer_url as the first film_videos row.
INSERT INTO film_videos (film_id, title, video_url, sort_order)
SELECT id, 'Trailer', trailer_url, 0 FROM films WHERE trailer_url IS NOT NULL AND trailer_url != '';

ALTER TABLE films DROP COLUMN trailer_url;
