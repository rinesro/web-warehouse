// src/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Menggunakan 'as any' untuk melewati pengecekan ketat tipe AdapterUser
  adapter: PrismaAdapter(prisma) as any, 
  session: { 
    strategy: "jwt",
    maxAge: 30 * 60, // Sesi mati otomatis jika idle 30 menit
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = compareSync(credentials.password as string, user.password);
        if (!isValid) return null;

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: { tokenVersion: { increment: 1 } },
        });

        return updatedUser;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      // Pastikan token memiliki id sebelum mengecek ke database
      if (!token.id) return session;

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
      });

      // Jika user tidak ada atau versi token tidak cocok (sudah login di tempat lain)
      if (!dbUser || token.tokenVersion !== dbUser.tokenVersion) {
        // Alih-alih mengembalikan objek kosong, kita kembalikan session standar tanpa user
        // agar middleware mendeteksi user tidak login
        return { ...session, user: { ...session.user, id: "" } };
      }

      // Sinkronisasi data asli dari Database ke UI
      session.user.id = dbUser.id;
      session.user.role = dbUser.role;
      session.user.name = dbUser.name;
      session.user.email = dbUser.email;

      return session;
    },
  },
});