const pool = require('../db');

exports.getPanel = async (req, res) => {
  try {
    const user = req.session.user;

    res.render('admin-panel', {
      user,
      sessionID: req.sessionID,
    });
  } catch (error) {
    console.error('Error en panel admin:', error);
    res.status(500).render('error', {
      message: 'Error al cargar el panel de administrador.',
      error: { status: 500 },
    });
  }
};

exports.getAccessLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      'SELECT * FROM access_logs ORDER BY fecha DESC LIMIT 100'
    );

    res.render('admin-panel', {
      user: req.session.user,
      sessionID: req.sessionID,
      activeTab: 'accesos-correctos',
      logs,
    });
  } catch (error) {
    console.error('Error al obtener accesos correctos:', error);
    res.status(500).render('error', {
      message: 'Error al cargar los registros de acceso.',
      error: { status: 500 },
    });
  }
};

exports.getFailedAccessLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      'SELECT * FROM failed_access_logs ORDER BY fecha DESC LIMIT 100'
    );

    res.render('admin-panel', {
      user: req.session.user,
      sessionID: req.sessionID,
      activeTab: 'accesos-fallidos',
      logs,
    });
  } catch (error) {
    console.error('Error al obtener accesos fallidos:', error);
    res.status(500).render('error', {
      message: 'Error al cargar los registros de acceso fallido.',
      error: { status: 500 },
    });
  }
};

exports.getLogoutLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      'SELECT * FROM logout_logs ORDER BY fecha DESC LIMIT 100'
    );

    res.render('admin-panel', {
      user: req.session.user,
      sessionID: req.sessionID,
      activeTab: 'cierres-sesion',
      logs,
    });
  } catch (error) {
    console.error('Error al obtener cierres de sesión:', error);
    res.status(500).render('error', {
      message: 'Error al cargar los registros de cierre de sesión.',
      error: { status: 500 },
    });
  }
};
