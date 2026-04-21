function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/auth/login');
}

function isNotAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    // Si ya está autenticado, redirige al panel correspondiente
    return res.redirect(req.session.user.rol === 'admin' ? '/admin/panel' : '/user/panel');
  }
  next();
}

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
};
