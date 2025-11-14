import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, signIn } from "@/lib/auth";

import { signInWithCredentials } from "./actions";

async function signInWithGitHub() {
  "use server";

  await signIn("github", { redirectTo: "/dashboard" });
}

async function signInWithEmail(formData: FormData) {
  "use server";

  const email = formData.get("email");

  if (typeof email === "string" && email.length > 3) {
    await signIn("resend", {
      email,
      redirectTo: "/dashboard",
    });
  }
}

type SignInPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const canUseGitHub =
    Boolean(process.env.GITHUB_ID) && Boolean(process.env.GITHUB_SECRET);

  const canUseEmail =
    Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.EMAIL_FROM);

  const resolvedSearchParams = await searchParams;

  const errorParam = resolvedSearchParams?.error;
  const messageParam =
    resolvedSearchParams?.message ?? resolvedSearchParams?.success;

  const errorMessage =
    typeof errorParam === "string" ? errorParam : undefined;
  const infoMessage =
    typeof messageParam === "string" ? messageParam : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to access your workspaces and ship faster with a production
            grade stack.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
          {infoMessage ? (
            <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {infoMessage}
            </p>
          ) : null}
          <form action={signInWithCredentials} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/forgot-password"
                className="text-muted-foreground underline-offset-4 hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Button className="w-full" type="submit">
              Sign in
            </Button>
          </form>

          {canUseGitHub ? (
            <form action={signInWithGitHub}>
              <Button className="w-full" type="submit" variant="outline">
                Sign in with GitHub
              </Button>
            </form>
          ) : null}

          {canUseEmail ? (
            <form action={signInWithEmail} className="space-y-3">
              <div className="space-y-2 text-left">
                <Label htmlFor="email-magic">Email address</Label>
                <Input
                  id="email-magic"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <Button type="submit" variant="ghost" className="w-full">
                Email me a magic link
              </Button>
              <p className="text-xs text-muted-foreground">
                We will send a one-time sign-in link using Resend.
              </p>
            </form>
          ) : null}

          {!canUseGitHub && !canUseEmail ? (
            <p className="text-sm text-muted-foreground">
              No authentication providers are configured yet. Set the required
              environment variables for GitHub OAuth or Resend magic links to
              enable sign in.
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/sign-up"
              className="text-primary underline-offset-4 hover:underline"
            >
              지금 가입하기
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

