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
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { email, password } = validacion.data;

    // Buscar en la base de datos
    const resUser = await query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    const user = resUser.rows[0];

    if (!user || user.status !== "activo") {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    // Verificar password
    const passwordValido = await bcrypt.compare(password, user.password);
    if (!passwordValido) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    // Solo permitir acceso al Dashboard si es admin o moderator
    if (user.role !== "admin" && user.role !== "moderator") {
      return NextResponse.json(
        { error: "Acceso denegado. Rol insuficiente." },
        { status: 403 },
      );
    }

    const payload = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = generarAccessToken(payload);
    const refreshToken = generarRefreshToken(payload);

    // Guardar Refresh Token en la DB
    const expiracionRefresh = new Date();
    expiracionRefresh.setDate(expiracionRefresh.getDate() + 7);
    await query(
      "UPDATE usuarios SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3",
      [refreshToken, expiracionRefresh, user.id],
    );

    // Crear la respuesta y setear las Cookies Seguras (HttpOnly)
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
    });

    // Cookie del Access Token (Expira en 15 min)
    response.cookies.set("admin_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutos
      path: "/",
    });

    // Cookie del Refresh Token (Expira en 7 días)
    response.cookies.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en web-login:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
