const pool = require('../db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { describeClient } = require('../utils/browserInfo');

function mapLogsWithClientInfo(logs = []) {
  return logs.map((log) => ({
    ...log,
    clientInfo: describeClient(log.user_agent),
  }));
}

exports.getAuditReport = async (req, res) => {
  try {
    // Obtener estadísticas de accesos correctos
    const accessLogsResult = await pool.query(
      'SELECT COUNT(*) as total FROM access_logs'
    );
    const totalAccessos = Number(accessLogsResult.rows[0]?.total || 0);

    // Obtener estadísticas de accesos fallidos
    const failedLogsResult = await pool.query(
      'SELECT COUNT(*) as total FROM failed_access_logs'
    );
    const totalFallidos = Number(failedLogsResult.rows[0]?.total || 0);

    // Obtener estadísticas de cierres de sesión
    const logoutLogsResult = await pool.query(
      'SELECT COUNT(*) as total FROM logout_logs'
    );
    const totalCierres = Number(logoutLogsResult.rows[0]?.total || 0);

    // Obtener top 10 usuarios más activos (accesos correctos)
    const topUsersResult = await pool.query(
      `SELECT correo, COUNT(*) as accesos 
       FROM access_logs 
       GROUP BY correo 
       ORDER BY accesos DESC 
       LIMIT 10`
    );
    const topUsers = topUsersResult.rows;

    // Obtener últimos 20 registros de cada bitácora
    const recentAccessLogsResult = await pool.query(
      'SELECT * FROM access_logs ORDER BY fecha DESC LIMIT 20'
    );
    const recentAccessLogs = mapLogsWithClientInfo(recentAccessLogsResult.rows);

    const recentFailedLogsResult = await pool.query(
      'SELECT * FROM failed_access_logs ORDER BY fecha DESC LIMIT 20'
    );
    const recentFailedLogs = mapLogsWithClientInfo(recentFailedLogsResult.rows);

    const recentLogoutLogsResult = await pool.query(
      'SELECT * FROM logout_logs ORDER BY fecha DESC LIMIT 20'
    );
    const recentLogoutLogs = mapLogsWithClientInfo(recentLogoutLogsResult.rows);

    res.render('audit-report', {
      user: req.session.user,
      sessionID: req.sessionID,
      stats: {
        totalAccessos,
        totalFallidos,
        totalCierres,
        totalEventos: totalAccessos + totalFallidos + totalCierres,
      },
      topUsers,
      recentAccessLogs,
      recentFailedLogs,
      recentLogoutLogs,
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).render('error', {
      message: 'Error al generar el reporte de auditoría.',
      error: { status: 500 },
    });
  }
};

exports.downloadPDF = async (req, res) => {
  try {
    // Obtener todas las estadísticas
    const accessLogsResult = await pool.query(
      'SELECT COUNT(*) as total FROM access_logs'
    );
    const totalAccessos = Number(accessLogsResult.rows[0]?.total || 0);

    const failedLogsResult = await pool.query(
      'SELECT COUNT(*) as total FROM failed_access_logs'
    );
    const totalFallidos = Number(failedLogsResult.rows[0]?.total || 0);

    const logoutLogsResult = await pool.query(
      'SELECT COUNT(*) as total FROM logout_logs'
    );
    const totalCierres = Number(logoutLogsResult.rows[0]?.total || 0);

    const topUsersResult = await pool.query(
      `SELECT correo, COUNT(*) as accesos 
       FROM access_logs 
       GROUP BY correo 
       ORDER BY accesos DESC 
       LIMIT 10`
    );
    const topUsers = topUsersResult.rows;

    const recentAccessLogsResult = await pool.query(
      'SELECT * FROM access_logs ORDER BY fecha DESC LIMIT 50'
    );
    const recentAccessLogs = recentAccessLogsResult.rows;

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte-auditoria-${new Date().toISOString().split('T')[0]}.pdf"`
    );

    doc.pipe(res);

    // Título principal
    doc.fontSize(24).font('Helvetica-Bold').text('REPORTE DE AUDITORÍA', {
      align: 'center',
    });
    doc.fontSize(12).font('Helvetica').text(`Generado: ${new Date().toLocaleString('es-ES')}`, {
      align: 'center',
    });
    doc.moveDown();

    // Resumen ejecutivo
    doc.fontSize(14).font('Helvetica-Bold').text('1. RESUMEN EJECUTIVO', { underline: true });
    doc.fontSize(11).font('Helvetica');
    doc.text(`• Total de eventos registrados: ${totalAccessos + totalFallidos + totalCierres}`);
    doc.text(`• Accesos exitosos: ${totalAccessos}`);
    doc.text(`• Accesos fallidos: ${totalFallidos}`);
    doc.text(`• Cierres de sesión: ${totalCierres}`);
    doc.moveDown();

    // Tasas
    const tasaExito = totalAccessos + totalFallidos > 0 
      ? ((totalAccessos / (totalAccessos + totalFallidos)) * 100).toFixed(2)
      : 0;
    doc.text(`• Tasa de éxito en autenticación: ${tasaExito}%`);
    doc.moveDown();

    // Top usuarios
    doc.fontSize(14).font('Helvetica-Bold').text('2. USUARIOS MÁS ACTIVOS', { underline: true });
    doc.fontSize(11).font('Helvetica');
    topUsers.forEach((user, idx) => {
      doc.text(`${idx + 1}. ${user.correo}: ${user.accesos} accesos`);
    });
    doc.moveDown();

    // Datos técnicos capturados
    doc.fontSize(14).font('Helvetica-Bold').text('3. DATOS TÉCNICOS CAPTURADOS POR EVENTO', { underline: true });
    doc.fontSize(10).font('Helvetica');
    doc.text('• Identificador de usuario (ID y correo)');
    doc.text('• Fecha y hora exacta del evento (TIMESTAMP)');
    doc.text('• Tipo de acción (acceso exitoso, fallido, cierre)');
    doc.text('• Dirección IP de origen (para rastrear ubicación)');
    doc.text('• User-Agent (navegador y sistema operativo)');
    doc.text('• Rol del usuario (admin/usuario regular)');
    doc.text('• Motivo de fallo (si aplica)');
    doc.moveDown();

    // Pie de página
    doc.fontSize(9).font('Helvetica').text(
      'Este reporte fue generado automáticamente por el sistema de auditoría.',
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).render('error', {
      message: 'Error al descargar el reporte PDF.',
      error: { status: 500 },
    });
  }
};
