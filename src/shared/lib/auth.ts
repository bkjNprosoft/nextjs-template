import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, {
  type DefaultSession,
  type NextAuthConfig,
  type User,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/shared/lib/prisma";
import { verifyPassword } from "@/shared/lib/password";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

type NextAuthConfigType = NextAuthConfig;

type ExtendedUser = User & { role?: UserRole };

const credentialsProvider = Credentials({
  id: "credentials",
  name: "Email & Password",
  credentials: {
    email: {
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
    },
    password: { label: "Password", type: "password" },
  },
  authorize: async (credentials) => {
    const email =
      typeof credentials?.email === "string" ? credentials.email : undefined;
    const password =
      typeof credentials?.password === "string"
        ? credentials.password
        : undefined;

    if (!email || !password) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user?.passwordHash) {
      return null;
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return null;
    }

    const authenticatedUser: ExtendedUser = {
      id: user.id,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      role: user.role,
    };

    return authenticatedUser;
  },
});

const providers: Provider[] = [];
let hasExternalProvider = false;

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
  hasExternalProvider = true;
}

if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
  providers.push(
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM,
    }),
  );
  hasExternalProvider = true;
}

providers.push(credentialsProvider);

const secret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV !== "production" ? "dev-secret" : undefined);

const useCredentialsFallback = !hasExternalProvider;

const authConfig: NextAuthConfigType = {
  adapter: PrismaAdapter(prisma) as NextAuthConfigType["adapter"],
  session: {
    strategy: useCredentialsFallback ? "jwt" : "database",
  },
  trustHost: true,
  secret,
  providers,
  pages: {
    signIn: "/sign-in",
    newUser: "/sign-up",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role =
          ((user as ExtendedUser).role as UserRole | undefined) ??
          UserRole.CUSTOMER;
      }

      return token;
    },
    session({ session, user, token }) {
      if (!session.user) {
        return session;
      }

      const roleFromToken =
        (token?.role as UserRole | undefined) ??
        (user?.role as UserRole | undefined) ??
        UserRole.CUSTOMER;

      const userId =
        (typeof user?.id === "string" ? user.id : undefined) ??
        (typeof token?.sub === "string" ? token.sub : undefined) ??
        (typeof session.user.id === "string" ? session.user.id : undefined);

      if (!userId) {
        throw new Error("Authenticated user is missing an identifier.");
      }

      session.user.id = userId;
      session.user.role = roleFromToken;

      return session;
    },
    redirect({ url, baseUrl }) {
      // 상대 경로를 절대 경로로 변환
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // 같은 도메인인지 확인
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth(authConfig);


