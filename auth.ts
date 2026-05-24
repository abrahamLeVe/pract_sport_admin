// auth.ts
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
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
});
