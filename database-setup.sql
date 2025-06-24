-- Script para crear la base de datos y tabla de contactos
-- Ejecutar este script en SQL Server Management Studio o sqlcmd

-- Crear la base de datos si no existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ContactFormDB')
BEGIN
    CREATE DATABASE ContactFormDB;
    PRINT 'Base de datos ContactFormDB creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos ContactFormDB ya existe.';
END
GO

-- Usar la base de datos
USE ContactFormDB;
GO

-- Crear la tabla de contactos si no existe
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='contactos' AND xtype='U')
BEGIN
    CREATE TABLE contactos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        correo NVARCHAR(100) NOT NULL,
        telefono NVARCHAR(20),
        mensaje NVARCHAR(MAX) NOT NULL,
        fecha_creacion DATETIME DEFAULT GETDATE()
    );
    PRINT 'Tabla contactos creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La tabla contactos ya existe.';
END
GO

-- Crear índice para mejorar el rendimiento en búsquedas por correo
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_contactos_correo')
BEGIN
    CREATE INDEX IX_contactos_correo ON contactos(correo);
    PRINT 'Índice en correo creado exitosamente.';
END
GO

-- Crear índice para mejorar el rendimiento en búsquedas por fecha
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_contactos_fecha')
BEGIN
    CREATE INDEX IX_contactos_fecha ON contactos(fecha_creacion);
    PRINT 'Índice en fecha_creacion creado exitosamente.';
END
GO

-- Verificar que todo se creó correctamente
SELECT 
    'Base de datos' as Tipo,
    name as Nombre
FROM sys.databases 
WHERE name = 'ContactFormDB'

UNION ALL

SELECT 
    'Tabla' as Tipo,
    name as Nombre
FROM sys.tables 
WHERE name = 'contactos'

UNION ALL

SELECT 
    'Índice' as Tipo,
    name as Nombre
FROM sys.indexes 
WHERE object_id = OBJECT_ID('contactos') AND name LIKE 'IX_%';
GO 