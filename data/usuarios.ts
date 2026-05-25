// data/usuarios.ts
import { query } from "@/lib/db";

// Buscar un usuario por email (Utilizado por Auth.js)
export async function obtenerUsuarioPorEmail(email: string) {
  const res = await query(
    "SELECT id, name, email, password, role FROM usuarios WHERE email = $1 LIMIT 1",
    [email],
  );
  return res.rows[0] || null;
}

// Crear un nuevo usuario en la base de datos
export async function crearUsuarioEnDb(
  name: string,
  email: string,
  passwordHash: string,
  role: string,
  created_by: number | null, // 👈 Recibe el ID del administrador
) {
  const res = await query(
    `INSERT INTO usuarios (name, email, password, role, created_by) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, role`,
    [name, email, passwordHash, role, created_by],
  );
  return res.rows[0];
}

// Listar todos los usuarios para tu <DataTable />
export async function obtenerTodosLosUsuarios() {
  const res = await query(
    "SELECT id, name, email, role FROM usuarios ORDER BY id DESC",
  );
  return res.rows;
}
