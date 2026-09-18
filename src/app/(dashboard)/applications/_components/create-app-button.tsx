'use client';

import { Controller, useForm } from 'react-hook-form';
import { PlusIcon } from 'lucide-react';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { toast } from 'sonner';
import { type } from 'arktype';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

import type { SubmitEventHandler } from 'react';

const CreateApplicationFormSchema = type({
  name: type.keywords.string.trim.preformatted
    .atLeastLength(1)
    .configure({ message: '名稱為必填欄位' }),
});
type CreateApplicationFormSchema = typeof CreateApplicationFormSchema.infer;

export function CreateApplicationButton() {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm<CreateApplicationFormSchema>({
    defaultValues: {
      name: '',
    },
    resolver: arktypeResolver(CreateApplicationFormSchema),
  });

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }

    setOpen(open);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await authClient.oauth2.createClient({
      client_name: data.name,
      redirect_uris: [],
    });

    if (result.error) {
      toast.error('建立使用者時發生錯誤', {
        description: result.error.message,
      });
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ['authClient.oauth2.getClients'],
    });

    onOpenChange(false);
    toast.success('使用者建立成功');
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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立應用程式</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <FieldSet>
            <FieldGroup>
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field
                    data-disabled={form.formState.isSubmitting}
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={field.name}>應用程式名稱*</FieldLabel>

                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      data-1p-ignore
                      disabled={form.formState.isSubmitting}
                      id={field.name}
                      placeholder="我的應用程式"
                      required
                      type="text"
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <DialogFooter className="sm:justify-between">
                <DialogClose
                  render={
                    <Button
                      disabled={form.formState.isSubmitting}
                      type="button"
                      variant="outline"
                    >
                      取消
                    </Button>
                  }
                />

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
            </FieldGroup>
          </FieldSet>
        </form>
      </DialogContent>
    </Dialog>
  );
}
