import { query } from './connection.js';

const runtimeCreateMigrations = [
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

  `CREATE TABLE IF NOT EXISTS program_slides (
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

  `CREATE TABLE IF NOT EXISTS regional_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) DEFAULT 'RJ',
    address VARCHAR(300),
    phone VARCHAR(30),
    email VARCHAR(255),
    coordinator VARCHAR(200),
    description TEXT,
    image_url VARCHAR(500),
    maps_url VARCHAR(700),
    active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    txn_id VARCHAR(255) NOT NULL UNIQUE,
    payer_email VARCHAR(255),
    payer_name VARCHAR(200),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status ENUM('completed','pending','refunded','failed') DEFAULT 'pending',
    payment_date DATETIME,
    item_name VARCHAR(300),
    raw_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date),
    INDEX idx_txn_id (txn_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const runtimeAlterColumnMigrations = [
  { table: 'news', column: 'external_url', definition: 'VARCHAR(700) AFTER image_url' },
  { table: 'pastorals', column: 'address', definition: 'VARCHAR(300) AFTER location' },
  { table: 'pastorals', column: 'map_url', definition: 'VARCHAR(700) AFTER address' },
  { table: 'pastorals', column: 'image_url', definition: 'VARCHAR(500) AFTER map_url' },
  { table: 'admin_users', column: 'totp_secret', definition: 'VARCHAR(255) NULL AFTER password_hash' },
  { table: 'admin_users', column: 'totp_enabled', definition: 'TINYINT(1) DEFAULT 0 AFTER totp_secret' },
  { table: 'social_services', column: 'images', definition: 'JSON NULL AFTER icon' },
];

async function columnExists(table, column) {
  const rows = await query(
    `SELECT COUNT(*) AS n
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0]?.n > 0;
}

async function addColumnIfMissing({ table, column, definition }) {
  if (await columnExists(table, column)) return;
  await query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

export async function ensureRuntimeSchema() {
  for (const sql of runtimeCreateMigrations) {
    try {
      await query(sql);
    } catch (err) {
      console.error('Runtime schema check failed:', err?.message || err);
    }
  }

  for (const migration of runtimeAlterColumnMigrations) {
    try {
      await addColumnIfMissing(migration);
    } catch (err) {
      console.error('Runtime schema check failed:', err?.message || err);
    }
  }
}
