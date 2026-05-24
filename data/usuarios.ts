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
) {
  // Si desde el formulario de administración pasas el rol, se guardará ese (admin/moderator).
  // Si en el futuro haces un formulario público y no envías el parámetro 'role', la DB le pondrá 'user' automáticamente.
  const res = await query(
    "INSERT INTO usuarios (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [name, email, passwordHash, role],
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
