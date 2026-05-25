// app/actions/usuarios.ts
"use server";

import { z } from "zod";
import { loginSchema, registroUsuarioSchema } from "@/lib/zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import {
  generarAccessToken,
  generarRefreshToken,
  verificarAccessToken,
} from "@/lib/jwt";

// =======================================================
// 🛠️ HELPERS CENTRALIZADOS (Tipados y sin Duplicidad)
// =======================================================

/**
 * Parsea los errores de Zod usando flatten() para evitar problemas con propiedades obsoletas de treeify
 */
function formatearErroresZod(
  error: z.ZodError,
  datosCrudos: Record<string, string>,
) {
  // 1. Usamos la función oficial recomendada por tu versión de Zod
  const errorArbol = z.treeifyError(error);

  // 2. Definimos de forma estricta la interfaz que TypeScript espera encontrar en el árbol compilado
  // Cada propiedad del formulario tendrá un arreglo opcional de errores internos
  const propiedadesErrores =
    (
      errorArbol as {
        properties?: Record<string, { errors?: string[] }>;
      }
    ).properties || {};

  const fields: Record<string, { message: string | null; value: string }> = {};

  for (const llave of Object.keys(datosCrudos)) {
    // 3. Extraemos el error del campo actual usando el tipado seguro que acabamos de definir
    const erroresDelCampo = propiedadesErrores[llave]?.errors;

    fields[llave] = {
      message:
        erroresDelCampo && erroresDelCampo.length > 0
          ? erroresDelCampo[0]
          : null,
      value: llave === "password" ? "" : datosCrudos[llave] || "",
    };
  }

  return fields;
}
/**
 * Middleware interno para proteger Server Actions basados en Roles
 */
async function obtenerSesionProtegida(rolesPermitidos: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_access_token")?.value;

  if (!token) return { error: "No autorizado. Inicia sesión para continuar." };

  const usuarioLogueado = verificarAccessToken(token);
  if (!usuarioLogueado)
    return { error: "Sesión expirada. Por favor, vuelve a ingresar." };

  if (!rolesPermitidos.includes(usuarioLogueado.role)) {
    return { error: "Acceso denegado. Permisos insuficientes." };
  }

  return { usuario: usuarioLogueado };
}

// =======================================================
// 🚀 ACCIONES EXPORTADAS
// =======================================================

// 🔑 INICIAR SESIÓN DIRECTO
export async function loginUsuarioAction(
  prevState: unknown,
  formData: FormData,
) {
  const datosCrudos = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;
  const validacion = loginSchema.safeParse(datosCrudos);

  if (!validacion.success) {
    return {
      error: "Por favor, ingresa un correo y contraseña válidos.",
      fields: formatearErroresZod(validacion.error, datosCrudos),
    };
  }

  const { email, password } = validacion.data;
  let loginExitoso = false;

  try {
    const resUser = await query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    const user = resUser.rows[0];

    if (!user || user.status !== "activo") {
      return {
        error: "Credenciales incorrectas o cuenta inactiva.",
        fields: {
          email: { message: null, value: email },
          password: { message: null, value: "" },
        },
      };
    }

    const passwordValido = await bcrypt.compare(password, user.password);
    if (!passwordValido) {
      return {
        error: "Credenciales incorrectas.",
        fields: {
          email: { message: null, value: email },
          password: { message: null, value: "" },
        },
      };
    }

    if (user.role !== "admin" && user.role !== "moderator") {
      return {
        error: "Acceso denegado. Permisos insuficientes.",
        fields: {
          email: { message: null, value: email },
          password: { message: null, value: "" },
        },
      };
    }

    const payload = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    };
    const accessToken = generarAccessToken(payload);
    const refreshToken = generarRefreshToken(payload);

    const expiracionRefresh = new Date();
    expiracionRefresh.setDate(expiracionRefresh.getDate() + 7);
    await query(
      "UPDATE usuarios SET refresh_token = $1, refresh_token_expires_at = $2 WHERE id = $3",
      [refreshToken, expiracionRefresh, user.id],
    );

    const cookieStore = await cookies();
    cookieStore.set("admin_access_token", accessToken, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10,
    });

    cookieStore.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    });

    loginExitoso = true;
  } catch (error) {
    console.error("Error en login:", error);
    return {
      error: "Ocurrió un error inesperado al conectar con la base de datos.",
      fields: {
        email: { message: null, value: email },
        password: { message: null, value: "" },
      },
    };
  }

  if (loginExitoso) redirect("/dashboard");
}

// 🚪 CERRAR SESIÓN DIRECTO
export async function logoutUsuarioAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("admin_access_token", "", { path: "/", maxAge: 0 });
    cookieStore.set("admin_refresh_token", "", { path: "/", maxAge: 0 });
    return { success: true };
  } catch (error) {
    console.error("Error en logout:", error);
    return { success: false };
  }
}

// 🛡️ REGISTRAR USUARIOS PROTEGIDO
export async function registrarUsuarioAction(
  prevState: unknown,
  formData: FormData,
) {
  const datosCrudos = Object.fromEntries(formData.entries()) as Record<
    string,
    string
  >;
  const validacion = registroUsuarioSchema.safeParse(datosCrudos);

  if (!validacion.success) {
    return {
      error: "Hay errores en el formulario.",
      fields: formatearErroresZod(validacion.error, datosCrudos),
    };
  }

  const { name, email, password, role } = validacion.data;

  try {
    const auth = await obtenerSesionProtegida(["admin"]);

    if (auth.error) {
      return {
        error: auth.error,
        fields: {
          name: { message: null, value: name },
          email: { message: null, value: email },
          password: { message: null, value: "" },
          role: { message: null, value: role },
        },
      };
    }

    const creadorId = parseInt(auth.usuario!.id, 10);

    const existeEmail = await query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email],
    );
    if (existeEmail.rows.length > 0) {
      return {
        error: "El correo electrónico ya se encuentra registrado.",
        fields: {
          name: { message: null, value: name },
          email: { message: "Este correo ya existe.", value: email },
          password: { message: null, value: "" },
          role: { message: null, value: role },
        },
      };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHasheado = await bcrypt.hash(password, salt);

    await query(
      `INSERT INTO usuarios (name, email, password, role, status, created_by) 
       VALUES ($1, $2, $3, $4, 'activo', $5)`,
      [name, email, passwordHasheado, role, creadorId],
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      error: "Error interno en el servidor al procesar el registro.",
      fields: {
        name: { message: null, value: name },
        email: { message: null, value: email },
        password: { message: null, value: "" },
        role: { message: null, value: role },
      },
    };
  }

  redirect("/dashboard/usuarios");
}
