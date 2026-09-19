'use client';

import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import {
  type OAuthApplicationType,
  validateOAuthRedirectUri,
} from '@/lib/oauth-redirect-uri';
import { authClient } from '@/server/auth/client';

type CreateApplicationFormValues = {
  applicationType: OAuthApplicationType;
  name: string;
  redirectUris: Array<{ value: string }>;
};

export function CreateApplicationButton() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateApplicationFormValues>({
    defaultValues: {
      applicationType: 'web',
      name: '',
      redirectUris: [{ value: '' }],
    },
    mode: 'onChange',
  });
  const redirectUris = useFieldArray({
    control: form.control,
    name: 'redirectUris',
  });
  const applicationType = useWatch({
    control: form.control,
    name: 'applicationType',
  });

  const onOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }
    setOpen(nextOpen);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const uris = data.redirectUris.map(({ value }) => value.trim());
    const invalidIndex = uris.findIndex((uri) =>
      validateOAuthRedirectUri(uri, data.applicationType),
    );
    if (invalidIndex >= 0) {
      form.setError(`redirectUris.${invalidIndex}.value`, {
        message:
          validateOAuthRedirectUri(
            uris[invalidIndex] ?? '',
            data.applicationType,
          ) ?? undefined,
      });
      return;
    }

    const result = await authClient.oauth2.createClient({
      client_name: data.name.trim(),
      redirect_uris: uris,
      token_endpoint_auth_method:
        data.applicationType === 'native' ? 'none' : 'client_secret_basic',
      type: data.applicationType,
    });

    if (result.error) {
      toast.error('建立應用程式時發生錯誤', {
        description: result.error.message,
      });
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ['authClient.oauth2.getClients'],
    });
    onOpenChange(false);
    toast.success('應用程式建立成功');
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) =>
    void handleSubmit(event);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            建立應用程式
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>建立應用程式</DialogTitle>
          <DialogDescription>
            選擇應用程式類型，並設定 OAuth 授權完成後允許返回的 URI。
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
                rules={{ required: '名稱為必填欄位' }}
              />

              <Controller
                control={form.control}
                name="applicationType"
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>應用程式類型</FieldLabel>
                    <NativeSelect
                      {...field}
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                      id={field.name}
                      onChange={(event) => {
                        field.onChange(event);
                        void form.trigger('redirectUris');
                      }}
                    >
                      <NativeSelectOption value="web">
                        Web 應用程式
                      </NativeSelectOption>
                      <NativeSelectOption value="native">
                        原生應用程式
                      </NativeSelectOption>
                    </NativeSelect>
                    <FieldDescription>
                      原生應用程式可使用反向網域 deep link，且不會取得 Client
                      Token。
                    </FieldDescription>
                  </Field>
                )}
              />

              <Field>
                <FieldLabel>重新導向 URI</FieldLabel>
                <div className="space-y-3">
                  {redirectUris.fields.map((redirectUri, index) => (
                    <Controller
                      control={form.control}
                      key={redirectUri.id}
                      name={`redirectUris.${index}.value`}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <div className="flex gap-2">
                            <Input
                              {...field}
                              aria-invalid={fieldState.invalid}
                              disabled={form.formState.isSubmitting}
                              placeholder={
                                applicationType === 'native'
                                  ? 'com.example.app:/callback'
                                  : 'https://example.com/oauth/callback'
                              }
                            />
                            <Button
                              aria-label="移除重新導向 URI"
                              disabled={
                                form.formState.isSubmitting
                                || redirectUris.fields.length === 1
                              }
                              onClick={() => redirectUris.remove(index)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
                          <FieldError errors={[fieldState.error]} />
                        </Field>
                      )}
                      rules={{
                        validate: (value) =>
                          validateOAuthRedirectUri(value, applicationType)
                          ?? true,
                      }}
                    />
                  ))}
                </div>
                <Button
                  disabled={form.formState.isSubmitting}
                  onClick={() => redirectUris.append({ value: '' })}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <PlusIcon />
                  新增 URI
                </Button>
                <FieldDescription>
                  Web 應用程式使用 HTTPS 或 HTTP loopback
                  URI；原生應用程式亦可使用 deep link。
                </FieldDescription>
              </Field>
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
                建立
              </Button>
            </DialogFooter>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
