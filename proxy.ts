import { NextRequest, NextResponse } from "next/server";
import {
  verificarAccessToken,
  verificarRefreshToken,
  generarAccessToken,
} from "@/lib/jwt";
import { query } from "@/lib/db";

// 🛠️ CAMBIO AQUÍ: Cambiamos 'handleProxy' a 'proxy'
export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Proteger estrictamente las rutas del dashboard
  if (pathname.startsWith("/dashboard")) {
    const accessToken = req.cookies.get("admin_access_token")?.value;
    const refreshToken = req.cookies.get("admin_refresh_token")?.value;

    // Si no hay ningún token, redirigir directo al login (raíz)
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. Intentar validar el Access Token
    if (accessToken) {
      const usuarioValido = verificarAccessToken(accessToken);
      if (
        usuarioValido &&
        (usuarioValido.role === "admin" || usuarioValido.role === "moderator")
      ) {
        // Token perfectamente válido, permitir continuar a la ruta
        return NextResponse.next();
      }
    }

    // 3. Si el Access Token falló o venció, pero hay un Refresh Token, intentamos renovar
    if (refreshToken) {
      const datosRefresh = verificarRefreshToken(refreshToken);

      if (datosRefresh) {
        // Validar integridad del Refresh Token contra PostgreSQL
        const resUser = await query(
          "SELECT id, name, email, role, refresh_token_expires_at FROM usuarios WHERE id = $1 AND refresh_token = $2",
          [datosRefresh.id, refreshToken],
        );
        const user = resUser.rows[0];

        // Verificar si el usuario existe, está activo y su token no ha caducado en DB
        if (user && new Date() < new Date(user.refresh_token_expires_at)) {
          // Generar nuevo Access Token de 15 minutos
          const nuevoAccessToken = generarAccessToken({
            id: user.id.toString(),
            email: user.email,
            role: user.role,
          });

          const response = NextResponse.next();

          // Inyectar la nueva cookie actualizada en la respuesta
          response.cookies.set("admin_access_token", nuevoAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60,
            path: "/",
          });

          return response;
        }
      }
    }

    // Si llegó aquí es porque los tokens eran inválidos, falsificados o revocados
    const responseInvalida = NextResponse.redirect(new URL("/", req.url));
    responseInvalida.cookies.delete("admin_access_token");
    responseInvalida.cookies.delete("admin_refresh_token");
    return responseInvalida;
  }

  // Si no es una ruta del dashboard, permitir el paso libre
  return NextResponse.next();
}

// 🛠️ ADICIONAL: Por seguridad, la exportamos también como default
export default proxy;
