-- Script para crear la base de datos y tablas para PostgreSQL
-- Ejecutar este script en PostgreSQL

-- Crear extensión si no existe para UUIDs (opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla de contactos
CREATE TABLE IF NOT EXISTS contact (
    Id SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20),
    Mensaje TEXT NOT NULL,
    RecaptchaToken TEXT,
    Terms BOOLEAN DEFAULT FALSE,
    Status BOOLEAN DEFAULT FALSE,
    FechaCreacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios para login
CREATE TABLE IF NOT EXISTS login (
    Id SERIAL PRIMARY KEY,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FechaCreacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Insertar usuario administrador por defecto (password: admin123)
-- Hash generado con bcrypt para 'admin123'
INSERT INTO login (Email, Password) 
VALUES ('admin@componentesleads.com', '$2y$10$nZc1RPslcbMLbFzdUy8VUeGCV.M1bgIve6i5rUfNhYaVOiig3dJEK')
ON CONFLICT (Email) DO NOTHING;