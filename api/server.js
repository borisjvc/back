const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config.env') });
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendDiscordNotification } = require('./utils/discord');

const app = express();
app.use(cors());

app.use(express.json());


// Endpoint para guardar datos del formulario
app.post('/contact', async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje, recaptchaToken, terms } = req.body;

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes' });
    }
    const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EmailRegex.test(correo)) {
      return res.status(400).json({ success: false, message: 'Formato de correo inválido' });
    }
    const InsertQuery = `INSERT INTO contact (Nombre, Correo, Telefono, Mensaje, RecaptchaToken, Terms) VALUES ($1, $2, $3, $4, $5, $6) RETURNING Id, FechaCreacion`;
    const Result = await pool.query(InsertQuery, [nombre, correo, telefono || '', mensaje, recaptchaToken || '', !!terms]);
    const Lead = { 
      Id: Result.rows[0].Id, 
      nombre, 
      correo, 
      telefono, 
      mensaje, 
      FechaCreacion: Result.rows[0].FechaCreacion 
    };
    // Notificación
    sendDiscordNotification(Lead);
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
    const Result = await pool.query('SELECT Id, Email, Password FROM login WHERE Email = $1', [email]);
    if (!Result.rows.length) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    const User = Result.rows[0];
    const Match = await bcrypt.compare(password, User.password);
    if (!Match) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    const Token = jwt.sign({ UserId: User.id, Email: User.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token: Token });
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
    const Result = await pool.query('SELECT Id, Nombre, Correo, Telefono, Mensaje, FechaCreacion, Status FROM contact ORDER BY FechaCreacion DESC');
    res.json({ success: true, total: Result.rows.length, data: Result.rows });
  } catch (err) {
    console.error('Error obteniendo leads:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Endpoint para actualizar el status de un lead (protegido)
app.patch('/leads/:id/status', auth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (typeof status !== 'boolean') {
    return res.status(400).json({ success: false, message: 'Status debe ser booleano' });
  }

  try {
    const Result = await pool.query(
      'UPDATE contact SET Status = $1 WHERE Id = $2 RETURNING Id, Status',
      [status, id]
    );

    if (!Result.rowCount) {
      return res.status(404).json({ success: false, message: 'Lead no encontrado' });
    }

    res.json({ success: true, data: Result.rows[0] });
  } catch (err) {
    console.error('Error actualizando status:', err);
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

if (require.main === module) {
  const Port = process.env.PORT || 3001;
  app.listen(Port, () => {
    console.log(`Servidor escuchando en el puerto ${Port}`);
  });
}

module.exports = app;