'use client';

import { Controller, useForm } from 'react-hook-form';
import { PlusIcon } from 'lucide-react';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { toast } from 'sonner';
import { type } from 'arktype';
import { useState } from 'react';

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/server/auth/client';

import type { SubmitEventHandler } from 'react';

const CreatePasskeyFormSchema = type({
  name: type.string
    .atLeastLength(1).configure({ message: '名稱為必填欄位' })
    .atMostLength(50).configure({ message: '名稱不能超過 50 個字元' }),
});

type CreatePasskeyButtonProps = Readonly<{
  onSuccess?: () => void;
}>;

type CreatePasskeyFormSchema = typeof CreatePasskeyFormSchema.infer;

export function CreatePasskeyButton({ onSuccess }: CreatePasskeyButtonProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreatePasskeyFormSchema>({
    defaultValues: {
      name: '',
    },
    resolver: arktypeResolver(CreatePasskeyFormSchema),
  });

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await authClient.passkey.addPasskey({
      name: data.name,
    });

    if (result.error) {
      toast.error('建立密碼金鑰時發生錯誤');
      console.error(result.error);
      return;
    }

    onOpenChange(false);
    toast.success('密碼金鑰建立成功');
    onSuccess?.();
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) => void handleSubmit(event);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger
        render={(
          <Button>
            <PlusIcon />
            新增密碼金鑰
          </Button>
        )}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立密碼金鑰</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldSet>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-disabled={form.formState.isSubmitting} data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>名稱*</FieldLabel>

                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      data-1p-ignore
                      disabled={form.formState.isSubmitting}
                      id={field.name}
                      placeholder="我的密碼金鑰"
                      required
                      type="text"
                    />

                    <FieldDescription>
                      為這個密碼金鑰取一個有意義的名稱，例如裝置名稱
                    </FieldDescription>

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <DialogFooter className="sm:justify-between">
                <DialogClose
                  render={
                    <Button disabled={form.formState.isSubmitting} type="button" variant="outline">取消</Button>
                  }
                />

                <Button disabled={form.formState.isSubmitting} type="submit">建立</Button>
              </DialogFooter>
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
