'use client';

import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { OAuthClient } from '@better-auth/oauth-provider';
import type { SubmitEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

const ApplicationFormSchema = type({
  name: type.keywords.string.trim.preformatted.atLeastLength(1).configure({
    message: '名稱為必填欄位',
  }),
  redirectUris: type.keywords.string.trim.preformatted
    .atLeastLength(1)
    .configure({ message: '至少需要一個重新導向 URI' }),
});

type ApplicationFormValues = typeof ApplicationFormSchema.infer;

function parseRedirectUris(value: string) {
  return value
    .split(/\r?\n/)
    .map((uri) => uri.trim())
    .filter(Boolean);
}

function validateRedirectUris(value: string) {
  const uris = parseRedirectUris(value);
  if (!uris.length) {
    return '至少需要一個重新導向 URI';
  }

  for (const uri of uris) {
    try {
      const url = new URL(uri);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'URI 必須使用 http 或 https';
      }
    } catch {
      return `無效的 URI：${uri}`;
    }
  }

  return true;
}

type ApplicationFormDialogProps = { application?: OAuthClient };

export function ApplicationFormDialog({
  application,
}: ApplicationFormDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = Boolean(application);

  const form = useForm<ApplicationFormValues>({
    defaultValues: {
      name: application?.client_name ?? '',
      redirectUris: application?.redirect_uris.join('\n') ?? '',
    },
    mode: 'onChange',
    resolver: arktypeResolver(ApplicationFormSchema),
  });

  const onOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset({
        name: application?.client_name ?? '',
        redirectUris: application?.redirect_uris.join('\n') ?? '',
      });
    }
    setOpen(nextOpen);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const redirectUris = parseRedirectUris(data.redirectUris);
    const redirectUrisError = validateRedirectUris(data.redirectUris);
    if (redirectUrisError !== true) {
      form.setError('redirectUris', { message: redirectUrisError });
      return;
    }

    const result =
      isEditing && application
        ? await authClient.oauth2.updateClient({
            client_id: application.client_id,
            update: { client_name: data.name, redirect_uris: redirectUris },
          })
        : await authClient.oauth2.createClient({
            client_name: data.name,
            redirect_uris: redirectUris,
          });

    if (result.error) {
      toast.error(
        isEditing ? '更新應用程式時發生錯誤' : '建立應用程式時發生錯誤',
        { description: result.error.message },
      );
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ['authClient.oauth2.getClients'],
    });
    onOpenChange(false);
    toast.success(isEditing ? '應用程式更新成功' : '應用程式建立成功');
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) =>
    void handleSubmit(event);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger
        render={
          <Button variant={isEditing ? 'ghost' : 'default'}>
            {isEditing ? <PencilIcon /> : <PlusIcon />}
            {isEditing ? '編輯' : '建立應用程式'}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '編輯應用程式' : '建立應用程式'}
          </DialogTitle>
          <DialogDescription>
            設定應用程式名稱與 OAuth 授權完成後要返回的網址。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldSet>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>應用程式名稱</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={form.formState.isSubmitting}
                      id={field.name}
                      placeholder="我的應用程式"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="redirectUris"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>重新導向 URI</FieldLabel>
                    <Textarea
                      {...field}
                      aria-invalid={fieldState.invalid}
                      disabled={form.formState.isSubmitting}
                      id={field.name}
                      placeholder="https://example.com/oauth/callback"
                      rows={4}
                    />
                    <FieldDescription>
                      每行填寫一個完整的 http 或 https 網址。
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
                rules={{ validate: validateRedirectUris }}
              />
            </FieldGroup>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    disabled={form.formState.isSubmitting}
                    type="button"
                    variant="outline"
                  />
                }
              >
                取消
              </DialogClose>
              <Button
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
                type="submit"
              >
                {form.formState.isSubmitting && <Spinner />}
                {isEditing ? '儲存變更' : '建立'}
              </Button>
            </DialogFooter>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateApplicationButton() {
  return <ApplicationFormDialog />;
}
