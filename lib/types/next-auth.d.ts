// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // 👈 Habilitamos la propiedad role en la sesión
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string; // 👈 Habilitamos la propiedad role en el objeto de autenticación
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string; // 👈 Habilitamos la propiedad role en el token cifrado JWT
  }
}
