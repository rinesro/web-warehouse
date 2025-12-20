import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [], // Diisi di auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Cek apakah ada user dan apakah id-nya valid
      const isLoggedIn = !!auth?.user && !!auth.user.id;
      const isOnDashboard = nextUrl.pathname.startsWith("/admin");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect ke login jika tidak ada sesi riil
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tokenVersion = user.tokenVersion;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tokenVersion = token.tokenVersion as number;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;