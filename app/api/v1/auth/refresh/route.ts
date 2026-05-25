import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { verificarRefreshToken, generarAccessToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token requerido" },
        { status: 400 },
      );
    }

    // 1. Verificar firma criptográfica del token
    const datosToken = verificarRefreshToken(refreshToken);
    if (!datosToken) {
      return NextResponse.json(
        { error: "Refresh token inválido o expirado" },
        { status: 401 },
      );
    }

    // 2. Verificar correspondencia e integridad en PostgreSQL
    const resUser = await query(
      "SELECT id, role, email, refresh_token_expires_at FROM usuarios WHERE id = $1 AND refresh_token = $2",
      [datosToken.id, refreshToken],
    );
    const user = resUser.rows[0];

    if (!user || new Date() > new Date(user.refresh_token_expires_at)) {
      return NextResponse.json(
        { error: "Sesión revocada o expirada" },
        { status: 401 },
      );
    }

    // 3. Emitir el nuevo Access Token reutilizando la sesión
    const nuevoAccessToken = generarAccessToken({
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ accessToken: nuevoAccessToken });
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
