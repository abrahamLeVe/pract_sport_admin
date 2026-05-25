"use server";

import { signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

import { auth, signIn } from "@/auth"; // 👈 ¡Añadimos auth aquí!
import { crearUsuarioEnDb, obtenerUsuarioPorEmail } from "@/data/usuarios";
import { loginSchema, registroUsuarioSchema } from "@/lib/zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registrarUsuarioAction(
  prevState: any,
  formData: FormData,
) {
  // 🛡️ 1. Verificar la sesión del administrador actual
  const session = await auth();

  if (!session || !session.user) {
    return {
      error: "No autorizado. Debes iniciar sesión para registrar miembros.",
    };
  }

  // Obtenemos el ID del administrador usando el tipado seguro que configuramos
  const adminId = Number(session.user.id);

  const datosCrudos = Object.fromEntries(formData.entries());
  const validacion = registroUsuarioSchema.safeParse(datosCrudos);

  if (!validacion.success) {
    const errorArbol = z.treeifyError(validacion.error);
    const props = errorArbol.properties;

    return {
      error: "Por favor, corrige los errores del formulario.",
      fields: {
        name: {
          message: props?.name?.errors?.[0] || null,
          value: (datosCrudos.name as string) || "",
        },
        email: {
          message: props?.email?.errors?.[0] || null,
          value: (datosCrudos.email as string) || "",
        },
        password: {
          message: props?.password?.errors?.[0] || null,
          value: (datosCrudos.password as string) || "",
        },
        role: {
          message: props?.role?.errors?.[0] || null,
          value: (datosCrudos.role as string) || "user",
        },
      },
    };
  }

  const { name, email, password, role } = validacion.data;

  try {
    // 2. Validar correos duplicados
    const usuarioExistente = await obtenerUsuarioPorEmail(email);
    if (usuarioExistente) {
      return {
        error: "El correo electrónico ya está registrado por otro miembro.",
        fields: {
          name: { message: null, value: name },
          email: { message: "Este correo ya está en uso.", value: email },
          password: { message: null, value: password },
          role: { message: null, value: role },
        },
      };
    }

    // 3. Encriptar contraseña de forma segura
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Guardar en PostgreSQL pasando el adminId como creador original
    await crearUsuarioEnDb(name, email, passwordHash, role, adminId); // 👈 ¡Pasamos el ID!

    revalidatePath("/dashboard/usuarios");
    return { success: true };
  } catch (error) {
    console.error("Error al registrar:", error);
    return {
      error: "Ocurrió un error inesperado en la base de datos.",
      fields: {
        name: { message: null, value: name },
        email: { message: null, value: email },
        password: { message: null, value: password },
        role: { message: null, value: role },
      },
    };
  }
}

export async function loginUsuarioAction(prevState: any, formData: FormData) {
  const datosCrudos = Object.fromEntries(formData.entries());

  // 1. Validar la estructura con Zod usando treeifyError sin deprecaciones
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
    // 2. Verificar si el usuario existe antes de intentar autenticar
    const usuario = await obtenerUsuarioPorEmail(email);

    if (!usuario) {
      return {
        error: "El correo electrónico no se encuentra registrado.",
        fields: {
          email: { message: "Usuario no registrado", value: email },
          password: { message: null, value: "" },
        },
      };
    }

    // 3. Invocar el inicio de sesión de Auth.js
    // Pasamos redirectTo para que Next.js te mande al dashboard automáticamente si el rol es válido
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error) {
    // ⚠️ REGLA DE ORO DE NEXT-AUTH:
    // Al redirigir, NextAuth arroja un error interno llamado "NEXT_REDIRECT".
    // Debemos dejar que ese error pase libremente para que Next.js procese el viaje de página.
    if (error instanceof AuthError) {
      return {
        error: "Credenciales incorrectas o acceso no autorizado para tu rol.",
        fields: {
          email: { message: null, value: email },
          password: { message: null, value: "" },
        },
      };
    }

    // Si es el error de redirección de Next.js, lo relanzamos para que funcione el viaje de página
    if ((error as any).message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error en login action:", error);
    return {
      error: "Ocurrió un error inesperado al procesar la autenticación.",
    };
  }
}

export async function logoutUsuarioAction() {
  // Invoca la destrucción de la sesión y redirige automáticamente a la pantalla de Login
  await signOut({ redirectTo: "/" });
}
