const axios = require('axios');
require('dotenv').config({ path: '../config.env' });

const { DISCORD_WEBHOOK_URL } = process.env;

async function sendDiscordNotification(lead) {
  if (!DISCORD_WEBHOOK_URL) return;
  const content = [
    '**Nuevo lead recibido**',
    `**Nombre:** ${lead.nombre}`,
    `**Correo:** ${lead.correo}`,
    `**Teléfono:** ${lead.telefono || 'N/D'}`,
    `**Mensaje:** ${lead.mensaje}`,
    `**Fecha:** ${lead.fecha_creacion}`
  ].join('\n');

  try {
    await axios.post(DISCORD_WEBHOOK_URL, { content });
  } catch (err) {
    console.error('Error enviando notificación Discord:', err.message);
  }
}

module.exports = { sendDiscordNotification }; 