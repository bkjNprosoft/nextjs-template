import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { SignUpForm } from "./sign-up-form";

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;

  const errorParam = resolvedSearchParams?.error;
  const infoParam = resolvedSearchParams?.message;

  const errorMessage =
    typeof errorParam === "string" ? errorParam : undefined;
  const infoMessage =
    typeof infoParam === "string" ? infoParam : undefined;

  return <SignUpForm initialError={errorMessage} initialInfo={infoMessage} />;
}

