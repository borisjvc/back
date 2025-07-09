const axios = require('axios');
const https = require('https');
require('dotenv').config({ path: '../config.env' });

const { DISCORD_WEBHOOK_URL } = process.env;

const agentIPv4 = new https.Agent({ family: 4, keepAlive: true });

async function sendDiscordNotification(lead) {
  if (!DISCORD_WEBHOOK_URL) return;
  const content = [
    '**Nuevo lead recibido**',
    `**Nombre:** ${lead.nombre}`,
    `**Correo:** ${lead.correo}`,
    `**Teléfono:** ${lead.telefono || 'N/D'}`,
    `**Mensaje:** ${lead.mensaje}`
  ].join('\n');

  try {
    await axios.post(DISCORD_WEBHOOK_URL, { content }, { httpsAgent: agentIPv4, timeout: 8000 });
  } catch (err) {
    console.error('Error enviando notificación Discord:', err.message);
  }
}

module.exports = { sendDiscordNotification }; 