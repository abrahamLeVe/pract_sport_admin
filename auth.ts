import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/zod";
import { obtenerUsuarioPorEmail } from "@/data/usuarios";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        try {
          const { email, password } = await loginSchema.parseAsync(credentials);

          const user = await obtenerUsuarioPorEmail(email);
          if (!user) return null;

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) return null;

          // 🛡️ RESTRICCIÓN DE SEGURIDAD CRÍTICA:
          // Si el usuario es un cliente común ('user'), bloqueamos el acceso al dashboard.
          if (user.role !== "admin" && user.role !== "moderator") {
            // Retornar null le indica a Auth.js que las credenciales no son válidas para entrar
            return null;
          }

          // Si pasa el filtro, retornamos el usuario con su ID y Rol correspondientes
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutos (900 segundos)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Transfiere el rol del token a la sesión del frontend
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Define tu ruta raíz como la pantalla oficial de Login
  },
});
