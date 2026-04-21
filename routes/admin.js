const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const reportController = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(isAuthenticated);
router.use(requireRole('admin'));

// Panel admin
router.get('/panel', adminController.getPanel);

// Bitácoras
router.get('/accesos-correctos', adminController.getAccessLogs);
router.get('/accesos-fallidos', adminController.getFailedAccessLogs);
router.get('/cierres-sesion', adminController.getLogoutLogs);

// Reporte de auditoría
router.get('/reporte', reportController.getAuditReport);
router.get('/reporte/pdf', reportController.downloadPDF);

module.exports = router;
