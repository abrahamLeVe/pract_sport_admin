// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // Evalúa si existe una sesión activa

  // Definimos qué rutas queremos proteger bajo llave
  const esRutaDashboard = nextUrl.pathname.startsWith("/dashboard");

  // 🛡️ Si intenta entrar al dashboard pero NO está logueado, lo mandamos al login (raíz)
  if (esRutaDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Si está logueado pero su rol no es válido, también podríamos botarlo desde aquí:
  const role = req.auth?.user?.role;
  if (
    esRutaDashboard &&
    isLoggedIn &&
    role !== "admin" &&
    role !== "moderator"
  ) {
    // Redirigir a una página de error o cerrar sesión si es un intruso con rol 'user'
    return NextResponse.redirect(new URL("/?error=NoAutorizado", nextUrl));
  }

  return NextResponse.next();
});

// Especificamos el "matcher" para decirle a Next.js que intercepte SOLO las rutas del dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
