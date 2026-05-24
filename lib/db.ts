// lib/db.ts
import { Pool } from "pg";

// El Pool mantiene conexiones persistentes abiertas listas para usar
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Función global para ejecutar consultas SQL de forma segura
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
