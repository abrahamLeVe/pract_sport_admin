import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verificarAccessToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    // 1. Capturar el token de la cabecera (Authorization: Bearer <token>)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Acceso denegado. Token faltante." },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];
    const usuarioLogueado = verificarAccessToken(token);

    if (!usuarioLogueado) {
      return NextResponse.json(
        { error: "Token inválido o vencido." },
        { status: 401 },
      );
    }

    // 2. Control de Permisos por Roles de Inka Team
    if (
      usuarioLogueado.role !== "admin" &&
      usuarioLogueado.role !== "moderator"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para ver este módulo." },
        { status: 403 },
      );
    }

    // 3. Si tiene el rol correcto, la consulta a PostgreSQL se ejecuta
    const result = await query(
      "SELECT id, name, email, role, status FROM usuarios ORDER BY id DESC",
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 });
  }
}
