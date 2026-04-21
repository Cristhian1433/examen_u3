const bcrypt = require('bcrypt');
const validator = require('validator');
const pool = require('../db');
const logger = require('../services/logger');

exports.register = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    if (!nombre || !correo || !contraseña || !rol) {
      return res.render('register', {
        error: 'Todos los campos son requeridos.',
      });
    }

    if (!validator.isEmail(correo)) {
      return res.render('register', {
        error: 'El correo no es valido.',
      });
    }

    if (contraseña.length < 6) {
      return res.render('register', {
        error: 'La contraseña debe tener al menos 6 caracteres.',
      });
    }

    if (!['user', 'admin'].includes(rol)) {
      return res.render('register', {
        error: 'El rol seleccionado no es valido.',
      });
    }

    const userExists = await pool.query(
      'SELECT id FROM users WHERE correo = $1',
      [correo]
    );

    if (userExists.rows.length > 0) {
      return res.render('register', {
        error: 'El correo ya esta registrado.',
      });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    await pool.query(
      'INSERT INTO users (nombre, correo, contrasena_hash, rol) VALUES ($1, $2, $3, $4)',
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
    console.log('[LOGIN] ========== INICIO LOGIN ==========');
    console.log('[LOGIN] req.body:', JSON.stringify(req.body));
    console.log('[LOGIN] Content-Type:', req.get('Content-Type'));

    const { correo, contraseña } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'unknown';

    console.log('[LOGIN] Intento de login:', correo);

    if (!correo || !contraseña) {
      await logger.logFailedAccess(
        correo || 'unknown',
        'Campos vacios',
        clientIp,
        userAgent
      );

      return res.status(400).render('login', {
        error: 'Correo y contraseña son requeridos.',
        registered: false,
      });
    }

    const userResult = await pool.query(
      'SELECT id, nombre, correo, contrasena_hash, rol FROM users WHERE correo = $1',
      [correo]
    );

    if (userResult.rows.length === 0) {
      await logger.logFailedAccess(
        correo,
        'Usuario no encontrado',
        clientIp,
        userAgent
      );

      return res.status(401).render('login', {
        error: 'Correo o contraseña invalidos.',
        registered: false,
      });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(contraseña, user.contrasena_hash);

    if (!passwordMatch) {
      await logger.logFailedAccess(
        correo,
        'Contraseña incorrecta',
        clientIp,
        userAgent
      );

      return res.status(401).render('login', {
        error: 'Correo o contraseña invalidos.',
        registered: false,
      });
    }

    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) {
        console.error('[LOGIN] Error al regenerar sesion:', regenerateErr);
        return res.status(500).render('login', {
          error: 'Error al crear sesion. Intenta de nuevo.',
          registered: false,
        });
      }

      req.session.user = {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
      };

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('[LOGIN] Error al guardar sesion:', saveErr);
          return res.status(500).render('login', {
            error: 'Error al crear sesion. Intenta de nuevo.',
            registered: false,
          });
        }

        const sessionId = req.sessionID;

        (async () => {
          try {
            await pool.query(
              'INSERT INTO active_sessions (usuario_id, session_id, ip_origen, user_agent, activa) VALUES ($1, $2, $3, $4, $5)',
              [user.id, sessionId, clientIp, userAgent, true]
            );
          } catch (err) {
            console.error('[LOGIN] Error al guardar sesion activa:', err);
          }

          await logger.logSuccessfulAccess(
            user.id,
            correo,
            user.rol,
            sessionId,
            clientIp,
            userAgent
          );

          const redirectPath = user.rol === 'admin' ? '/admin/panel' : '/user/panel';
          console.log('[LOGIN] Redirigiendo a:', redirectPath);
          res.redirect(redirectPath);
        })().catch((err) => {
          console.error('[LOGIN] Error posterior al guardado de sesion:', err);
          res.status(500).render('login', {
            error: 'Error al iniciar sesion. Intenta de nuevo.',
            registered: false,
          });
        });
      });
    });
  } catch (error) {
    console.error('[LOGIN] Error en login:', error);
    res.status(500).render('login', {
      error: 'Error al iniciar sesion. Intenta de nuevo.',
      registered: false,
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

      await logger.logLogout(id, correo, rol, sessionId, clientIp, userAgent);

      try {
        await pool.query(
          'UPDATE active_sessions SET activa = $1 WHERE session_id = $2',
          [false, sessionId]
        );
      } catch (err) {
        console.error('Error al marcar sesion inactiva:', err);
      }
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesion:', err);
      }
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.redirect('/');
  }
};
