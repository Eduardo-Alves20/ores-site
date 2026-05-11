import { query } from './connection.js';

const runtimeMigrations = [
  // Features adicionadas depois do primeiro deploy.
  `CREATE TABLE IF NOT EXISTS hero_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eyebrow VARCHAR(120),
    title VARCHAR(300) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(500),
    primary_label VARCHAR(100),
    primary_url VARCHAR(300),
    secondary_label VARCHAR(100),
    secondary_url VARCHAR(300),
    duration_ms INT DEFAULT 6000,
    display_order INT DEFAULT 0,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_order (active, display_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS pastoral_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    subtitle VARCHAR(300),
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_order (active, display_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS prayer_group_slides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200),
    subtitle VARCHAR(300),
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active_order (active, display_order)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS word_of_day_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_key DATE NOT NULL UNIQUE,
    source_url VARCHAR(700) NOT NULL,
    source_title VARCHAR(300),
    source_description TEXT,
    reading_html LONGTEXT,
    gospel_html LONGTEXT,
    pope_words_html LONGTEXT,
    fetched_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fetched_at (fetched_at),
    INDEX idx_date_key (date_key)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `ALTER TABLE news ADD COLUMN IF NOT EXISTS external_url VARCHAR(700) AFTER image_url`,
  `ALTER TABLE pastorals ADD COLUMN IF NOT EXISTS address VARCHAR(300) AFTER location`,
  `ALTER TABLE pastorals ADD COLUMN IF NOT EXISTS map_url VARCHAR(700) AFTER address`,
  `ALTER TABLE pastorals ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) AFTER map_url`,
  `ALTER TABLE prayer_groups ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) AFTER coordinator_phone`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS description TEXT AFTER neighborhood`,
  `ALTER TABLE communities ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) AFTER description`,
  `ALTER TABLE homilies ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) AFTER audio_url`,
];

export async function ensureRuntimeSchema() {
  for (const sql of runtimeMigrations) {
    try {
      await query(sql);
    } catch (err) {
      console.error('Runtime schema check failed:', err?.message || err);
    }
  }
}
