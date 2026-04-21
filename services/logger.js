const pool = require('../db');

async function logSuccessfulAccess(userId, correo, rol, sessionId, ipOrigen, userAgent) {
  try {
    await pool.query(
      'INSERT INTO access_logs (usuario_id, correo, rol, session_id, ip_origen, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, correo, rol, sessionId, ipOrigen, userAgent]
    );
  } catch (error) {
    console.error('Error al registrar acceso correcto:', error);
  }
}

async function logFailedAccess(correoIntentado, motivo, ipOrigen, userAgent) {
  try {
    await pool.query(
      'INSERT INTO failed_access_logs (correo_intentado, motivo, ip_origen, user_agent) VALUES (?, ?, ?, ?)',
      [correoIntentado, motivo, ipOrigen, userAgent]
    );
  } catch (error) {
    console.error('Error al registrar acceso fallido:', error);
  }
}

async function logLogout(userId, correo, rol, sessionId, ipOrigen, userAgent) {
  try {
    await pool.query(
      'INSERT INTO logout_logs (usuario_id, correo, rol, session_id, ip_origen, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, correo, rol, sessionId, ipOrigen, userAgent]
    );
  } catch (error) {
    console.error('Error al registrar cierre de sesión:', error);
  }
}

module.exports = {
  logSuccessfulAccess,
  logFailedAccess,
  logLogout,
};
