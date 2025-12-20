import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  // Cek apakah user login dan id-nya tidak kosong (hasil dari Live Check)
  const isLoggedIn = !!req.auth?.user?.id;
  
  const isOnAdmin = nextUrl.pathname.startsWith("/admin");

  if (isOnAdmin && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};