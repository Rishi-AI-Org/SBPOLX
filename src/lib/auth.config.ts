import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Prisma, no Node.js-only APIs.
// Used by proxy.ts (runs on Edge runtime) and extended by auth.ts.
export const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password") ||
        pathname.startsWith("/api/auth")
      ) {
        if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
          return Response.redirect(new URL("/browse", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { isAdmin?: boolean }).isAdmin =
          token.isAdmin as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
