// app/actions/usuarios.ts
"use server";

import { z } from "zod";
import { loginSchema } from "@/lib/zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function loginUsuarioAction(prevState: any, formData: FormData) {
  const datosCrudos = Object.fromEntries(formData.entries());

  // 1. Validar la estructura con Zod sin deprecaciones
  const validacion = loginSchema.safeParse(datosCrudos);

  if (!validacion.success) {
    const errorArbol = z.treeifyError(validacion.error);
    const props = errorArbol.properties;

    return {
      error: "Por favor, ingresa un correo y contraseña válidos.",
      fields: {
        email: {
          message: props?.email?.errors?.[0] || null,
          value: (datosCrudos.email as string) || "",
        },
        password: {
          message: props?.password?.errors?.[0] || null,
          value: "",
        },
      },
    };
  }

  const { email, password } = validacion.data;

  try {
    // 2. Consumir el endpoint interno de Login Web que configura las cookies
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const respuestaApi = await fetch(`${baseUrl}/api/v1/auth/web-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const resultadoJson = await respuestaApi.json();

    if (!respuestaApi.ok) {
      return {
        error:
          resultadoJson.error ||
          "Credenciales incorrectas o acceso no autorizado.",
        fields: {
          email: { message: null, value: email },
          password: { message: null, value: "" },
        },
      };
    }

    // 3. Reenviar las cookies generadas por la API al cliente de forma segura
    const cookieStore = await cookies();
    const setCookieHeaders = respuestaApi.headers.getSetCookie();

    for (const cookieStr of setCookieHeaders) {
      const [nameValue, ...rest] = cookieStr.split(";");
      const [name, value] = nameValue.split("=");

      cookieStore.set(name.trim(), value.trim(), {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }
  } catch (error) {
    console.error("Error en flujo de login action:", error);
    return {
      error: "No se pudo conectar con el servicio de autenticación.",
      fields: {
        email: { message: null, value: email },
        password: { message: null, value: "" },
      },
    };
  }

  // 4. Si todo salió excelente, redirigimos al dashboard fuera del try/catch
  redirect("/dashboard");
}
