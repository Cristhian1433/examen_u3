const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(isAuthenticated);
router.use(requireRole('user'));

// Panel usuario
router.get('/panel', userController.getPanel);

module.exports = router;
