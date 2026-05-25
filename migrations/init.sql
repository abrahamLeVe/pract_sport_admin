-- Limpieza inicial: Borra todo en orden jerárquico inverso para que no se atranquen las llaves foráneas
DROP TABLE IF EXISTS galeria_torneos, inscripciones, productos, competencias, usuarios CASCADE;

-- =======================================================
-- 1. EXTENSIONES Y SEGURIDAD
-- =======================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- 2. USUARIOS Y ROLES (Admins, Competidores, Clientes)
-- =======================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 🛡️ CAMPOS DE AUDITORÍA
    created_by INT REFERENCES usuarios(id) ON DELETE SET NULL, -- 👈 ¡AÑADIDO! Quién lo registró
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =======================================================
-- 3. MÓDULO DE COMPETENCIAS / TORNEOS
-- =======================================================
CREATE TABLE IF NOT EXISTS competencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,                  -- Ejemplo: 'Open Inka Team 2026'
    descripcion TEXT,
    fecha_evento DATE NOT NULL,
    precio_inscripcion DECIMAL(10, 2) NOT NULL,     -- Costo en Soles (PEN)
    status VARCHAR(20) NOT NULL DEFAULT 'abierto',  -- 'abierto', 'finalizado', 'oculto'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos de Auditoría
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =======================================================
-- 4. INSCRIPCIONES Y PAGOS (Yape, Plin, Transferencias)
-- =======================================================
CREATE TABLE IF NOT EXISTS inscripciones (
    id SERIAL PRIMARY KEY,
    competencia_id INT NOT NULL REFERENCES competencias(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria VARCHAR(50) NOT NULL,                -- Ejemplo: 'Adulto / Azul / -76kg'
    metodo_pago VARCHAR(30) NOT NULL,              -- 'Yape', 'Plin', 'Transferencia'
    monto_pagado DECIMAL(10, 2) NOT NULL,
    url_comprobante VARCHAR(255) NOT NULL,         -- URL de la captura subida (Yape/Plin)
    status_pago VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'verificado', 'rechazado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos de Auditoría CRÍTICOS
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =======================================================
-- 5. TIENDA VIRTUAL: PRODUCTOS (Suplementos, Ropa, Rashguards)
-- =======================================================
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,                  -- Ejemplo: 'Proteína Whey Creatina'
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    url_imagen VARCHAR(255),                       -- Foto del suplemento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos de Auditoría
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =======================================================
-- 6. GALERÍA DE IMÁGENES DE TORNEOS
-- =======================================================
CREATE TABLE IF NOT EXISTS galeria_torneos (
    id SERIAL PRIMARY KEY,
    competencia_id INT REFERENCES competencias(id) ON DELETE SET NULL,
    url_imagen VARCHAR(255) NOT NULL,              -- URL de la foto en la nube
    titulo VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos de Auditoría
    updated_at TIMESTAMP WITH TIME ZONE,
    updated_by INT REFERENCES usuarios(id) ON DELETE SET NULL
);