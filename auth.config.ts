// src/auth.config.ts 
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [], 
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user?.id;
      const role = auth?.user?.role;
      const pathname = nextUrl.pathname;

      // Izinkan Admin DAN User masuk ke folder /admin
      if (pathname.startsWith("/admin")) {
        if (isLoggedIn && (role === "admin" || role === "user")) {
          return true;
        }
        // Jika tidak login atau role tidak dikenal, lempar ke 403 atau login
        return isLoggedIn ? Response.redirect(new URL("/403", nextUrl)) : false;
      }
      
      return isLoggedIn;
    },

    async session({ session, token }) {
      // Pindahkan data dari token ke session 
      // Gunakan 'as string' untuk meyakinkan TypeScript nilainya tidak undefined 
      if (token && session.user) {
        session.user.id = token.id as string; 
        session.user.role = token.role as string;
        session.sessionId = token.sessionId as string; 
      }
      return session;
    },
  },
} satisfies NextAuthConfig;