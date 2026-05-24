// app/actions/usuarios.ts
"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { registroUsuarioSchema } from "@/lib/zod";
import { crearUsuarioEnDb, obtenerUsuarioPorEmail } from "@/data/usuarios";

export async function registrarUsuarioAction(
  prevState: any,
  formData: FormData,
) {
  // Convertimos el FormData a un objeto plano
  const datosCrudos = Object.fromEntries(formData.entries());

  // 1. Validamos los datos de forma segura con el esquema centralizado
  const validacion = registroUsuarioSchema.safeParse(datosCrudos);

  if (!validacion.success) {
    const errorArbol = z.treeifyError(validacion.error);

    // Mapeamos las propiedades al formato plano de inputs que necesitas
    const fieldErrors: Record<string, string[]> = {};

    if (errorArbol.properties) {
      Object.entries(errorArbol.properties).forEach(([key, value]) => {
        if (value && value.errors) {
          fieldErrors[key] = value.errors;
        }
      });
    }

    return {
      error: "Datos de formulario inválidos.",
      fields: fieldErrors, // <-- Ahora es un objeto limpio compatible con tus componentes
    };
  }

  const { name, email, password, role } = validacion.data;

  try {
    // 2. Comprobamos si el correo ya existe usando nuestra capa 'data'
    const usuarioExistente = await obtenerUsuarioPorEmail(email);
    if (usuarioExistente) {
      return { error: "El correo electrónico ya está registrado." };
    }

    // 3. Encriptamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Guardamos en la base de datos
    await crearUsuarioEnDb(name, email, passwordHash, role);

    // Refrescamos la UI del listado de usuarios
    revalidatePath("/dashboard/users");
    return { success: "Usuario creado exitosamente." };
  } catch (error) {
    console.error("Error en registrarUsuarioAction:", error);
    return { error: "Hubo un error interno en el servidor." };
  }
}
