const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

const pool = new Pool({
  host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ContactFormDB',
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Manejo de errores de conexión
pool.on('error', (ErrorEvent, Client) => {
  console.error('Error inesperado en el cliente de PostgreSQL:', ErrorEvent);
  process.exit(-1);
});

// Ejecución automática del script de inicialización de la base de datos
const Fs = require('fs');
const Path = require('path');

const SetupScriptPath = Path.join(__dirname, 'database-setup.sql');
try {
  const SetupScript = Fs.readFileSync(SetupScriptPath, 'utf8');
  (async () => {
    try {
      await pool.query(SetupScript);
      console.log('Base de datos lista');
    } catch (ScriptError) {
      console.error('Error ejecutando script de inicialización:', ScriptError);
      // Salimos para evitar que la aplicación continúe sin una base de datos válida
      process.exit(1);
    }
  })();
} catch (ReadError) {
  console.error('No se pudo leer el script de inicialización:', ReadError);
}

module.exports = pool; 