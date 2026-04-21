function getBrowserName(userAgent = '') {
  const ua = userAgent.toLowerCase();

  if (!ua) return 'Desconocido';
  if (ua.includes('edg/')) return 'Microsoft Edge';
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
  if (ua.includes('chrome/') && !ua.includes('edg/') && !ua.includes('opr/')) return 'Google Chrome';
  if (ua.includes('firefox/')) return 'Mozilla Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('trident/') || ua.includes('msie')) return 'Internet Explorer';

  return 'Desconocido';
}

function getOperatingSystem(userAgent = '') {
  const ua = userAgent.toLowerCase();

  if (!ua) return 'SO desconocido';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
  if (ua.includes('mac os x') || ua.includes('macintosh')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';

  return 'SO desconocido';
}

function describeClient(userAgent = '') {
  const browser = getBrowserName(userAgent);
  const os = getOperatingSystem(userAgent);

  return {
    browser,
    os,
    label: `${browser} en ${os}`,
    raw: userAgent || 'No disponible',
  };
}

module.exports = {
  describeClient,
};
