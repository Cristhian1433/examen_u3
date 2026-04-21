function requireRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.rol === role) {
      return next();
    }
    res.status(403).render('error', {
      message: 'Acceso denegado. No tienes permiso para acceder a este recurso.',
      error: { status: 403 },
    });
  };
}

module.exports = { requireRole };
