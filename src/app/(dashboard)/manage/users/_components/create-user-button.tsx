'use client';

import { DicesIcon, PlusIcon, TriangleAlertIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { toast } from 'sonner';
import { type } from 'arktype';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generatePassword, normalizeUsername } from '@/server/auth/utils';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { authClient } from '@/server/auth/client';
import { useTRPC } from '@/trpc/react';

import type { SubmitEventHandler } from 'react';

const CreateUserFormSchema = type({
  displayUsername: type.string,
  email: type.keywords.string
    .email.configure({ message: '無效的電子郵件' })
    .atLeastLength(1).configure({ message: '電子郵件為必填欄位' }),
  name: type.keywords.string.trim.preformatted
    .atLeastLength(3).configure({ message: '名稱至少需要 3 個字元' })
    .pipe(normalizeUsername),
  password: type.string
    .atLeastLength(8).configure({ message: '密碼至少需要 8 個字元' }),
});
type CreateUserFormSchema = typeof CreateUserFormSchema.infer;

export function CreateUserButton() {
  const [open, setOpen] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<CreateUserFormSchema>({
    defaultValues: {
      displayUsername: '',
      email: '',
      name: '',
      password: '',
    },
    resolver: arktypeResolver(CreateUserFormSchema),
  });

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }

    form.setValue('password', generatePassword());
    setOpen(open);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await authClient.admin.createUser({
      data: {
        displayUsername: data.displayUsername,
        username: data.name,
      },
      email: data.email,
      name: data.name,
      password: data.password,
    });

    if (result.error) {
      toast.error('建立使用者時發生錯誤', {
        description: result.error.message,
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: trpc.users.list.infiniteQueryKey() });

    onOpenChange(false);
    toast.success('使用者建立成功');
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) => void handleSubmit(event);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger
        render={(
          <Button>
            <PlusIcon />
            建立使用者
          </Button>
        )}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立使用者</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldSet>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => {
                  const value = field.value.trim();
                  const normalized = normalizeUsername(value);

                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>名稱*</FieldLabel>

                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        data-1p-ignore
                        id={field.name}
                        placeholder="xiaoming"
                        required
                        type="text"
                      />

                      {normalized !== value && (
                        <Alert variant="warning">
                          <TriangleAlertIcon />

                          <AlertDescription>
                            將會以
                            {' '}

                            {normalized}

                            {' '}
                            作為使用者名稱
                          </AlertDescription>
                        </Alert>
                      )}

                      <FieldDescription>
                        使用者名稱可以用於登入，只能包含小寫字母、數字和底線。
                      </FieldDescription>

                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  );
                }}
              />

              <Controller
                control={form.control}
                name="displayUsername"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      顯示名稱
                    </FieldLabel>

                    <Input
                      aria-invalid={fieldState.invalid}
                      autoComplete="name"
                      data-1p-ignore
                      id={field.name}
                      placeholder="王小明"
                      type="text"
                      {...field}
                    />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>電子郵件*</FieldLabel>

                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      data-1p-ignore
                      id={field.name}
                      placeholder="wang@example.com"
                      required
                      type="email"
                    />

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>密碼*</FieldLabel>

                    <ButtonGroup>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        data-1p-ignore
                        id={field.name}
                        required
                        type="text"
                      />

                      <Button
                        onClick={() => {
                          form.setValue('password', generatePassword());
                        }}
                        type="button"
                        variant="outline"
                      >
                        <DicesIcon />

                        <span>
                          隨機
                        </span>
                      </Button>
                    </ButtonGroup>

                    <FieldDescription>密碼必須至少 8 個字元</FieldDescription>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <DialogFooter className="sm:justify-between">
                <DialogClose
                  render={
                    <Button type="button" variant="outline">取消</Button>
                  }
                />

                <Button type="submit">建立</Button>
              </DialogFooter>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
