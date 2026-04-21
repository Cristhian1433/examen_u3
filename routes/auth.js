const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/authMiddleware');

// GET registro
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register', { error: null });
});

// POST registro
router.post('/register', isNotAuthenticated, authController.register);

// GET login
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', {
    error: null,
    registered: req.query.registered === 'true',
    loggedOut: req.query.loggedOut === 'true',
  });
});

// POST login
router.post('/login', isNotAuthenticated, authController.login);

// GET logout
router.get('/logout', authController.logout);

module.exports = router;
