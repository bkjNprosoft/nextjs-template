"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import type { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWorkspaceAction,
  initialCreateWorkspaceState,
} from "@/server/actions/workspaces";
import type { CreateWorkspaceState } from "@/server/actions/workspaces";

const clientSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters.")
    .max(64, "Workspace name must be 64 characters or fewer."),
});

type FormValues = z.infer<typeof clientSchema>;

type CreateWorkspaceFormProps = {
  onSuccess?: (state: Extract<CreateWorkspaceState, { success: true }>) => void;
};

export function CreateWorkspaceForm({
  onSuccess,
}: CreateWorkspaceFormProps): ReactElement {
  const [state, dispatch, isPending] = useActionState(
    createWorkspaceAction,
    initialCreateWorkspaceState,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (state.success) {
      form.reset();
      onSuccess?.(state);
    } else if (state.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        const message = messages?.[0];
        if (message) {
          form.setError(key as keyof FormValues, {
            type: "server",
            message,
          });
        }
      });
    }
    // we intentionally omit form/onSuccess from deps to avoid stale closures
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const submitValidValues = (values: FormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    void dispatch(formData);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void form.handleSubmit(submitValidValues)(event);
  };

  const nameError = form.formState.errors.name?.message;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          placeholder="Acme Collaboration Hub"
          autoComplete="organization"
          {...form.register("name")}
        />
        {nameError ? (
          <p className="text-sm text-destructive">{nameError}</p>
        ) : null}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating…
          </span>
        ) : (
          "Create workspace"
        )}
      </Button>
    </form>
  );
}

