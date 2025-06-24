const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// Función para conectar a la base de datos
async function connectDB() {
  try {
    await sql.connect(sqlConfig);
    console.log('Conectado a SQL Server');
    
    // Crear tabla si no existe
    await createTable();
  } catch (err) {
    console.error('Error conectando a la base de datos:', err);
  }
}

// Función para crear la tabla de contactos
async function createTable() {
  try {
    const createTableQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contactos' AND xtype='U')
      CREATE TABLE contactos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        correo NVARCHAR(100) NOT NULL,
        telefono NVARCHAR(20),
        mensaje NVARCHAR(MAX) NOT NULL,
        fecha_creacion DATETIME DEFAULT GETDATE()
      )
    `;
    
    await sql.query(createTableQuery);
    console.log('Tabla contactos creada o ya existente');
  } catch (err) {
    console.error('Error creando tabla:', err);
  }
}

// Endpoint para guardar datos del formulario
app.post('/postForm', async (req, res) => {
  try {
    const { nombre, correo, telefono, mensaje } = req.body;
    
    // Validación básica
    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, correo y mensaje son obligatorios'
      });
    }
    
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo electrónico no es válido'
      });
    }
    
    // Insertar datos en la base de datos
    const insertQuery = `
      INSERT INTO contactos (nombre, correo, telefono, mensaje)
      VALUES (@nombre, @correo, @telefono, @mensaje)
    `;
    
    const request = new sql.Request();
    request.input('nombre', sql.NVarChar, nombre);
    request.input('correo', sql.NVarChar, correo);
    request.input('telefono', sql.NVarChar, telefono || '');
    request.input('mensaje', sql.NVarChar, mensaje);
    
    await request.query(insertQuery);
    
    res.status(201).json({
      success: true,
      message: 'Formulario enviado con éxito'
    });
    
  } catch (error) {
    console.error('Error guardando formulario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para obtener todos los contactos
app.get('/contactos', async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, correo, telefono, mensaje, fecha_creacion
      FROM contactos
      ORDER BY fecha_creacion DESC
    `;
    
    const result = await sql.query(query);
    
    res.json({
      success: true,
      data: result.recordset,
      total: result.recordset.length
    });
    
  } catch (error) {
    console.error('Error obteniendo contactos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Servidor de formulario de contacto funcionando',
    endpoints: {
      postForm: 'POST /postForm - Guardar datos del formulario',
      getContactos: 'GET /contactos - Obtener todos los contactos'
    }
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  await connectDB();
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
}); 