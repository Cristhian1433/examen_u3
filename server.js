const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
require('dotenv').config();

const pool = require('./db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad
app.use(helmet());

// Vista engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Static files
app.use(express.static('public'));

// Parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Sesiones
const sessionStore = new MySQLStore({
  expiration: 24 * 60 * 60 * 1000, // 24 horas
  createDatabaseTable: true,
}, pool);

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
  },
}));

// Middleware para guardar datos globales en res.locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Rutas
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// Ruta 404
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Página no encontrada',
    error: { status: 404 },
  });
});

// Manejador de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});
