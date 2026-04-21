function isAuthenticated(req, res, next) {
  console.log('[AUTH MIDDLEWARE] Verificando autenticación');
  console.log('[AUTH MIDDLEWARE] req.session:', req.session);
  console.log('[AUTH MIDDLEWARE] req.session.user:', req.session?.user);
  
  if (req.session && req.session.user) {
    console.log('[AUTH MIDDLEWARE] Usuario autenticado:', req.session.user.correo);
    return next();
  }
  
  console.log('[AUTH MIDDLEWARE] NO autenticado, redirigiendo a login');
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
