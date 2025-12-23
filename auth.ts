// src/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma" 
import { compare } from "bcrypt-ts" 
import crypto from "crypto"
import { authConfig } from "./auth.config" 

export const GLOBAL_SESSION_VERSION = 1;

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password as string, user.password);
        if (!isValid) return null;

        // BUAT SESSION ID BARU
        const newSessionId = crypto.randomUUID();

        // UPDATE DATABASE: Simpan sessionId baru ini sebagai satu-satunya yang aktif
        await prisma.user.update({
          where: { id: user.id },
          data: { activeSessionId: newSessionId },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sessionId: newSessionId, // Kirim ke JWT
        };
      },
    }),
  ],
  // src/auth.ts (Bagian Callbacks)
  callbacks: {
    ...authConfig.callbacks, 

    async jwt({ token, user }) {
      // 1. Saat Login Awal
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionId = user.sessionId;
        token.globalVersion = user.globalVersion;
      }

      // 2. Cek Validitas Sesi
      // Gunakan pengecekan 'if (token.id)' untuk memastikan tidak undefined
      if (token.id) {
        if ((token.globalVersion as number) < GLOBAL_SESSION_VERSION) {
            return null; 
        }

        if (token.sessionId) {
            const dbUser = await prisma.user.findUnique({
              // TypeScript aman di sini karena sudah di dalam block 'if (token.id)'
              where: { id: token.id }, 
              select: { activeSessionId: true, role: true },
            });

            if (!dbUser || dbUser.activeSessionId !== token.sessionId) {
              return null;
            }
            if (dbUser.role) token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        // Gunakan Type Casting jika diperlukan agar assignable ke session.user
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.sessionId = token.sessionId as string;
      }
      return session;
    },
  },
});