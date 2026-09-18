'use client';

import { Controller, useForm } from 'react-hook-form';
import { ExternalLinkIcon, SaveIcon } from 'lucide-react';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { toast } from 'sonner';
import { type } from 'arktype';
import { useQueryClient } from '@tanstack/react-query';

import Link from 'next/link';

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';
import { useSession } from '@/components/providers/session-provider';
import { useTRPC } from '@/trpc/react';

import type { SubmitEventHandler } from 'react';

const UpdateUserFormSchema = type({
  displayUsername: 'string | undefined',
});
type UpdateUserFormSchema = typeof UpdateUserFormSchema.infer;

export function ProfileSection() {
  const { user } = useSession();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<UpdateUserFormSchema>({
    defaultValues: {
      displayUsername: user.displayUsername ?? undefined,
    },
    resolver: arktypeResolver(UpdateUserFormSchema),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await authClient.updateUser(data);

    if (result.error) {
      toast.error('更新個人檔案時發生錯誤', {
        description: result.error.message,
      });
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: trpc.users.list.infiniteQueryKey(),
    });
    toast.success('個人檔案更新成功');
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) =>
    void handleSubmit(event);

  return (
    <section className="space-y-2">
      <h2 className="font-bold text-lg">個人檔案</h2>

      <p className="text-muted-foreground">管理你的顯示名稱與頭像</p>

      <form onSubmit={onSubmit}>
        <FieldSet className="my-8">
          <FieldGroup>
            <Field orientation="vertical">
              <FieldLabel>使用者頭像</FieldLabel>

              <FieldContent className="flex-row gap-8 py-4">
                <Avatar className="size-24">
                  <AvatarImage
                    draggable={false}
                    src={`/api/user/${user.id}/image`}
                  />

                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex flex-col items-start justify-center gap-2">
                  在 Gravatar 上變更你的使用者頭像
                  <Link
                    className={buttonVariants({ variant: 'outline' })}
                    href="https://gravatar.com/profile/avatars"
                    referrerPolicy="no-referrer"
                    target="_blank"
                  >
                    前往 Gravatar
                    <ExternalLinkIcon />
                  </Link>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldSeparator />

          <FieldGroup>
            <Field data-disabled>
              <FieldLabel>帳號名稱</FieldLabel>

              <Input
                autoComplete="username"
                data-1p-ignore
                disabled
                readOnly
                type="text"
                value={user.name}
              />
            </Field>

            <Field data-disabled>
              <FieldLabel>電子郵件</FieldLabel>

              <Input
                autoComplete="username"
                data-1p-ignore
                disabled
                readOnly
                type="text"
                value={user.email}
              />
            </Field>

            <Controller
              control={form.control}
              name="displayUsername"
              render={({ field, fieldState }) => (
                <Field
                  data-disabled={form.formState.isSubmitting}
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor={field.name}>顯示名稱</FieldLabel>

                  <Input
                    aria-invalid={fieldState.invalid}
                    autoComplete="name"
                    data-1p-ignore
                    disabled={form.formState.isSubmitting}
                    id={field.name}
                    placeholder="王小明"
                    type="text"
                    {...field}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <Field orientation="horizontal">
              <Button type="submit">
                {form.formState.isSubmitting ? <Spinner /> : <SaveIcon />}
                儲存
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </section>
  );
}
