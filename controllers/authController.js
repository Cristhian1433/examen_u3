const bcrypt = require('bcrypt');
const validator = require('validator');
const pool = require('../db');
const logger = require('../services/logger');

exports.register = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // Validaciones
    if (!nombre || !correo || !contraseña || !rol) {
      return res.render('register', {
        error: 'Todos los campos son requeridos.',
      });
    }

    if (!validator.isEmail(correo)) {
      return res.render('register', {
        error: 'El correo no es válido.',
      });
    }

    if (contraseña.length < 6) {
      return res.render('register', {
        error: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    if (!['user', 'admin'].includes(rol)) {
      return res.render('register', {
        error: 'El rol seleccionado no es válido.',
      });
    }

    // Verificar si el correo ya existe
    const userExists = await pool.query(
      'SELECT id FROM users WHERE correo = $1',
      [correo]
    );

    if (userExists.rows.length > 0) {
      return res.render('register', {
        error: 'El correo ya está registrado.',
      });
    }

    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar usuario
    const result = await pool.query(
      'INSERT INTO users (nombre, correo, contraseña_hash, rol) VALUES ($1, $2, $3, $4)',
      [nombre, correo, hashedPassword, rol]
    );

    res.redirect('/auth/login?registered=true');
  } catch (error) {
    console.error('Error en registro:', error);
    res.render('register', {
      error: 'Error al registrar. Intenta de nuevo.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'unknown';

    // Validaciones
    if (!correo || !contraseña) {
      await logger.logFailedAccess(
        correo || 'unknown',
        'Campos vacíos',
        clientIp,
        userAgent
      );
      return res.render('login', {
        error: 'Correo y contraseña son requeridos.',
      });
    }

    // Buscar usuario
    const userResult = await pool.query(
      'SELECT id, nombre, correo, contraseña_hash, rol FROM users WHERE correo = $1',
      [correo]
    );

    if (userResult.rows.length === 0) {
      await logger.logFailedAccess(
        correo,
        'Usuario no encontrado',
        clientIp,
        userAgent
      );
      return res.render('login', {
        error: 'Correo o contraseña inválidos.',
      });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contraseña, user.contraseña_hash);

    if (!passwordMatch) {
      await logger.logFailedAccess(
        correo,
        'Contraseña incorrecta',
        clientIp,
        userAgent
      );
      return res.render('login', {
        error: 'Correo o contraseña inválidos.',
      });
    }

    // Regenerar sesión
    req.session.regenerate(async (err) => {
      if (err) {
        console.error('Error al regenerar sesión:', err);
        return res.render('login', {
          error: 'Error al crear sesión. Intenta de nuevo.',
        });
      }

      // Guardar datos en sesión
      req.session.user = {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      };

      // Guardar en tabla de sesiones activas
      const sessionId = req.sessionID;
      try {
        await pool.query(
          'INSERT INTO active_sessions (usuario_id, session_id, ip_origen, user_agent, activa) VALUES ($1, $2, $3, $4, $5)',
          [user.id, sessionId, clientIp, userAgent, true]
        );
      } catch (err) {
        console.error('Error al guardar sesión activa:', err);
      }

      // Registrar acceso correcto
      await logger.logSuccessfulAccess(
        user.id,
        correo,
        user.rol,
        sessionId,
        clientIp,
        userAgent
      );

      // Redirigir según rol
      if (user.rol === 'admin') {
        res.redirect('/admin/panel');
      } else {
        res.redirect('/user/panel');
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.render('login', {
      error: 'Error al iniciar sesión. Intenta de nuevo.',
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'unknown';

    if (req.session && req.session.user) {
      const { id, correo, rol } = req.session.user;
      const sessionId = req.sessionID;

      // Registrar cierre de sesión
      await logger.logLogout(id, correo, rol, sessionId, clientIp, userAgent);

      // Marcar sesión como inactiva
      try {
        await pool.query(
          'UPDATE active_sessions SET activa = $1 WHERE session_id = $2',
          [false, sessionId]
        );
      } catch (err) {
        console.error('Error al marcar sesión inactiva:', err);
      }
    }

    // Destruir sesión
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.redirect('/');
  }
};
