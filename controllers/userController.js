const pool = require('../db');

exports.getPanel = async (req, res) => {
  try {
    const user = req.session.user;
    const sessionId = req.sessionID;

    // Obtener información de sesión activa
    const [sessionResult] = await pool.query(
      'SELECT * FROM active_sessions WHERE session_id = ?',
      [sessionId]
    );

    const sessionInfo = sessionResult[0] || null;

    res.render('user-panel', {
      user,
      sessionID: req.sessionID,
      sessionInfo,
    });
  } catch (error) {
    console.error('Error en panel usuario:', error);
    res.status(500).render('error', {
      message: 'Error al cargar el panel de usuario.',
      error: { status: 500 },
    });
  }
};
