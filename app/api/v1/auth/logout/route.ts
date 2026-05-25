import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verificarAccessToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;

  // Intentar obtener el ID del usuario desde las cookies o la cabecera
  const cookieToken = req.headers
    .get("cookie")
    ?.split("admin_access_token=")[1]
    ?.split(";")[0];

  if (cookieToken) {
    const decodificado = verificarAccessToken(cookieToken);
    if (decodificado) userId = decodificado.id;
  }

  if (userId) {
    // Revocar el token limpiando la celda en PostgreSQL
    await query(
      "UPDATE usuarios SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = $1",
      [userId],
    );
  }

  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada correctamente",
  });

  // Destruir las cookies físicas del navegador
  response.cookies.delete("admin_access_token");
  response.cookies.delete("admin_refresh_token");

  return response;
}
