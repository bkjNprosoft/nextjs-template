"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateUserPreferencesAction } from "@/server/actions/notifications";
import type { UserPreference, ThemePreference } from "@prisma/client";

const settingsSchema = z.object({
  theme: z.enum(["SYSTEM", "LIGHT", "DARK"]),
  emailNotifications: z.boolean(),
});

type SettingsFormProps = {
  preferences: UserPreference | null;
};

export function SettingsForm({ preferences }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: (preferences?.theme as ThemePreference) ?? "SYSTEM",
      emailNotifications: preferences?.emailNotifications ?? true,
    },
  });

  const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("theme", values.theme);
      formData.append("emailNotifications", values.emailNotifications.toString());

      const result = await updateUserPreferencesAction(formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorMessage =
          result.errors._general?.[0] ||
          Object.values(result.errors).flat()[0] ||
          "설정 저장에 실패했습니다.";
        setError(errorMessage);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>테마</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SYSTEM">시스템 설정</SelectItem>
                  <SelectItem value="LIGHT">라이트</SelectItem>
                  <SelectItem value="DARK">다크</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                애플리케이션의 색상 테마를 선택하세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailNotifications"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>이메일 알림</FormLabel>
                <FormDescription>
                  주문 및 배송 관련 이메일 알림을 받습니다
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600">설정이 저장되었습니다.</p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </form>
    </Form>
  );
}

