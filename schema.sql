-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('user', 'admin')),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones activas
CREATE TABLE IF NOT EXISTS active_sessions (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  ip_origen VARCHAR(45),
  user_agent TEXT,
  activa BOOLEAN DEFAULT TRUE,
  creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de accesos correctos
CREATE TABLE IF NOT EXISTS access_logs (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  correo VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  session_id VARCHAR(255),
  ip_origen VARCHAR(45),
  user_agent TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de accesos fallidos
CREATE TABLE IF NOT EXISTS failed_access_logs (
  id SERIAL PRIMARY KEY,
  correo_intentado VARCHAR(100),
  motivo VARCHAR(255),
  ip_origen VARCHAR(45),
  user_agent TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cierres de sesión
CREATE TABLE IF NOT EXISTS logout_logs (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  correo VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL,
  session_id VARCHAR(255),
  ip_origen VARCHAR(45),
  user_agent TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_correo ON users(correo);
CREATE INDEX IF NOT EXISTS idx_access_logs_fecha ON access_logs(fecha);
CREATE INDEX IF NOT EXISTS idx_failed_logs_fecha ON failed_access_logs(fecha);
CREATE INDEX IF NOT EXISTS idx_logout_logs_fecha ON logout_logs(fecha);
