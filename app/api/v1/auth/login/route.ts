import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { loginSchema } from "@/lib/zod";
import { generarAccessToken, generarRefreshToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const cuerpo = await req.json();
    const validacion = loginSchema.safeParse(cuerpo);

    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos de entrada inválidos" },
        { status: 400 },
      );
    }

    const { email, password } = validacion.data;

    // Buscar usuario en DB
    const resUser = await query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    const user = resUser.rows[0];

    if (!user || user.status !== "activo") {
      return NextResponse.json(
        { error: "Credenciales incorrectas o cuenta inactiva" },
        { status: 401 },
      );
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, user.password);
    if (!passwordValido) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    const payload = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generarAccessToken(payload);
    const refreshToken = generarRefreshToken(payload);

    // Calcular expiración del refresh token (7 días a partir de hoy)
    const expiracionRefresh = new Date();
    expiracionRefresh.setDate(expiracionRefresh.getDate() + 7);

    // Guardar el Refresh Token en PostgreSQL para control de sesiones activas
    await query(
      "UPDATE usuarios SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3",
      [refreshToken, expiracionRefresh, user.id],
    );

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
