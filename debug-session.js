require('dotenv').config();
const pool = require('./db');

(async () => {
  try {
    console.log('Revisando sesiones en PostgreSQL...\n');
    
    const result = await pool.query('SELECT sid, sess, expire FROM "session" ORDER BY expire DESC LIMIT 5');
    
    result.rows.forEach((row, idx) => {
      console.log(`\n===== SESIÓN ${idx + 1} =====`);
      console.log('SID:', row.sid);
      console.log('EXPIRE:', row.expire);
      console.log('SESS (JSON):', JSON.stringify(row.sess, null, 2));
    });
    
    console.log('\n\nTotal de sesiones:', result.rows.length);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
