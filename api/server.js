const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../config.env' });
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendDiscordNotification } = require('./utils/discord');

const app = express();

// Middleware
app.use(cors({ origin: ['https://componentesleads.netlify.app'] }));
app.use(express.json());


// Configuración de SQL Server
const sqlConfig = {
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ContactFormDB',
  server: process.env.DB_SERVER || 'localhost',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


// Endpoint para guardar datos del formulario
app.post('/contact', async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje, recaptchaToken, terms } = req.body;
    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ success: false, message: 'Formato de correo inválido' });
    }
    const insertQuery = `INSERT INTO contact (nombre, correo, telefono, mensaje, recaptchaToken, terms) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(insertQuery, [nombre, correo, telefono || '', mensaje, recaptchaToken || '', !!terms]);
    const lead = { id: result.insertId, nombre, correo, telefono, mensaje, fecha_creacion: new Date() };
    // Notificación
    sendDiscordNotification(lead);
    res.status(201).json({ success: true, message: 'Formulario enviado con éxito' });
  } catch (err) {
    console.error('Error guardando formulario:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Endpoint de autenticación
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y password requeridos' });
  }
  try {
    const [rows] = await pool.query('SELECT id, email, password FROM login WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Middleware simple para verificar JWT
function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Endpoint para obtener leads (protegido)
app.get('/leads', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, correo, telefono, mensaje, fecha_creacion FROM contact ORDER BY fecha_creacion DESC');
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    console.error('Error obteniendo leads:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
}); 

module.exports = app;