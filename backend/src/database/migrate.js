import pool from './connection.js';
import dotenv from 'dotenv';
dotenv.config();

const migrations = [
  // Admin users
  `CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin','editor') NOT NULL DEFAULT 'editor',
    failed_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Refresh tokens (rotating)
  `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    family VARCHAR(255) NOT NULL,
    used TINYINT(1) DEFAULT 0,
    expires_at DATETIME NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_family (family)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Site settings (key-value)
  `CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    \`key\` VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Home carousel slides
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

  // Events
  `CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(200),
    category VARCHAR(100),
    description TEXT,
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (event_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // News
  `CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    category VARCHAR(100),
    summary TEXT,
    content LONGTEXT,
    image_url VARCHAR(500),
    external_url VARCHAR(700),
    published TINYINT(1) DEFAULT 1,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_published (published, published_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Projects (formerly pastorals)
  `CREATE TABLE IF NOT EXISTS pastorals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    coordinator VARCHAR(200),
    phone VARCHAR(30),
    meeting_day VARCHAR(100),
    meeting_time VARCHAR(50),
    location VARCHAR(200),
    address VARCHAR(300),
    map_url VARCHAR(700),
    image_url VARCHAR(500),
    active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Project gallery slides (formerly pastoral_slides)
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

  // Social Programs gallery slides (carousel on /programas page)
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

  // Regional Units (Unidades Regionais)
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

  // Facilities (Espaço ORES spaces)
  `CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    capacity INT,
    active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Social programs/services
  `CREATE TABLE IF NOT EXISTS social_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    images JSON,
    active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Courses
  `CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    duration VARCHAR(50),
    schedule VARCHAR(200),
    vacancies INT,
    description TEXT,
    active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Contact messages
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    read_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_read (read_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // PayPal donations
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

  // Audit log
  `CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin (admin_id),
    INDEX idx_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const alterColumnMigrations = [
  { table: 'pastorals', column: 'address', definition: 'VARCHAR(300) AFTER location' },
  { table: 'pastorals', column: 'map_url', definition: 'VARCHAR(700) AFTER address' },
  { table: 'pastorals', column: 'image_url', definition: 'VARCHAR(500) AFTER map_url' },
  { table: 'news', column: 'external_url', definition: 'VARCHAR(700) AFTER image_url' },
  { table: 'admin_users', column: 'totp_secret', definition: 'VARCHAR(255) NULL AFTER password_hash' },
  { table: 'admin_users', column: 'totp_enabled', definition: 'TINYINT(1) DEFAULT 0 AFTER totp_secret' },
  { table: 'social_services', column: 'images', definition: 'JSON NULL AFTER icon' },
];

async function columnExists(conn, table, column) {
  const [rows] = await conn.execute(
    `SELECT COUNT(*) AS n
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows[0]?.n > 0;
}

async function addColumnIfMissing(conn, { table, column, definition }) {
  if (await columnExists(conn, table, column)) return;
  await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
}

async function runMigrations() {
  const conn = await pool.getConnection();
  try {
    console.log('Running migrations...');
    for (const sql of migrations) {
      await conn.execute(sql);
    }
    for (const migration of alterColumnMigrations) {
      await addColumnIfMissing(conn, migration);
    }
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

runMigrations();
