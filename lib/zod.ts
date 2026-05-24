import { z } from "zod"; // <-- Importamos 'z' completo para usar la sintaxis moderna

// Validación para el Inicio de Sesión
export const loginSchema = z.object({
  email: z.email({ message: "Correo electrónico inválido" }), // <-- Resuelto usando z.string().email()
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

// Validación para Registrar un Usuario Nuevo
export const registroUsuarioSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.email({ message: "Correo electrónico inválido" }), // <-- Resuelto usando z.string().email()
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  role: z.string(),
});
