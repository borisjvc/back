# Backend - Servidor de Formulario de Contacto

Este servidor maneja el endpoint para guardar los datos del formulario de contacto en SQL Server.

## Requisitos Previos

- Node.js (versión 14 o superior)
- SQL Server (local o remoto)
- npm

## Instalación

1. Instalar dependencias:
```bash
npm install
```

## Configuración de la Base de Datos

### Opción 1: Usando SQL Server Management Studio
1. Abrir SQL Server Management Studio
2. Conectarse a tu instancia de SQL Server
3. Ejecutar el script `database-setup.sql`

### Opción 2: Usando sqlcmd
```bash
sqlcmd -S localhost -U sa -P your_password -i database-setup.sql
```

## Configuración del Servidor

1. Editar el archivo `config.env` con tus credenciales de SQL Server:
```env
# Configuración del servidor
PORT=3001

# Configuración de SQL Server
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=ContactFormDB

# Configuración adicional
NODE_ENV=development
```

## Ejecutar el Servidor

```bash
node server.js
```

El servidor se ejecutará en `http://localhost:3001`

## Endpoints

### POST /postForm
Guarda los datos del formulario de contacto.

**Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@email.com",
  "telefono": "555-123-4567",
  "mensaje": "Hola, me gustaría contactarlos..."
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Formulario enviado con éxito"
}
```

**Respuesta de error (400/500):**
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

### GET /
Endpoint de prueba que muestra información del servidor.

## Estructura de la Base de Datos

### Tabla: contactos
- `id` (INT, IDENTITY): Clave primaria
- `nombre` (NVARCHAR(100)): Nombre completo (obligatorio)
- `correo` (NVARCHAR(100)): Correo electrónico (obligatorio)
- `telefono` (NVARCHAR(20)): Número de teléfono (opcional)
- `mensaje` (NVARCHAR(MAX)): Mensaje del formulario (obligatorio)
- `fecha_creacion` (DATETIME): Fecha y hora de creación (automático)

## Validaciones

- Los campos `nombre`, `correo` y `mensaje` son obligatorios
- El formato del correo electrónico debe ser válido
- El teléfono es opcional

## Manejo de Errores

El servidor incluye:
- Validación de datos de entrada
- Manejo de errores de conexión a la base de datos
- Respuestas HTTP apropiadas
- Logging de errores en consola

## Seguridad

- Uso de parámetros preparados para prevenir SQL injection
- Validación de entrada en el servidor
- Configuración de CORS para el frontend 