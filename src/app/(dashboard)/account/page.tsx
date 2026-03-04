'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { ExternalLinkIcon, SaveIcon } from 'lucide-react';
import { SiDiscord as DiscordIcon } from '@icons-pack/react-simple-icons';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { toast } from 'sonner';
import { type } from 'arktype';

import Link from 'next/link';

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from '@/components/ui/field';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GravatarImage } from '@/components/gravatar';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';
import { useSession } from '@/components/providers/session-provider';
import { useTRPC } from '@/trpc/react';

import type { SubmitEventHandler } from 'react';

const UpdateUserFormSchema = type({
  displayUsername: type.string,
});
type UpdateUserFormSchema = typeof UpdateUserFormSchema.infer;

export default function DashboardProfilePage() {
  const { user } = useSession();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery({
    queryFn: async () => {
      const result = await authClient.listAccounts();
      if (result.error) throw new Error(result.error.message ?? '無法取得帳號資訊');
      return result.data;
    },
    queryKey: ['listAccounts'],
  });

  const { isPending: isUnlinkingDiscord, mutate: unlinkDiscord } = useMutation({
    mutationFn: async () => {
      const result = await authClient.unlinkAccount({ providerId: 'discord' });

      if (result.error) {
        toast.error('解除連繫時發生錯誤', {
          description: result.error.message,
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['listAccounts'] });
      toast.success('已解除連繫 Discord 帳號');
    },
  });

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

    await queryClient.invalidateQueries({ queryKey: trpc.users.list.infiniteQueryKey() });
    toast.success('個人檔案更新成功');
  });

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) => void handleSubmit(event);

  const hasDiscordLinked = accounts?.find((v) => v.providerId === 'discord');

  return (
    <div className="
      space-y-4 p-4
      md:p-8
      xl:p-16
    "
    >
      <div className="space-y-8 p-4">
        <h1 className="text-2xl">帳號資訊</h1>
        <form onSubmit={onSubmit}>
          <FieldSet>
            <FieldLegend className="py-2 text-lg">個人檔案</FieldLegend>
            <FieldGroup>
              <Field orientation="vertical">
                <FieldLabel>使用者頭像</FieldLabel>
                <FieldContent className="flex-row gap-8 py-4">
                  <Avatar className="size-24">
                    <GravatarImage email={user.email} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="
                    flex flex-col items-start justify-center gap-2
                  "
                  >
                    在 Gravatar 上變更你的使用者頭像
                    <Button
                      nativeButton={false}
                      render={(
                        <Link href="https://gravatar.com/profile/avatars" referrerPolicy="no-referrer" target="_blank">
                          前往 Gravatar
                          <ExternalLinkIcon />
                        </Link>
                      )}
                      variant="outline"
                    />
                  </div>
                </FieldContent>
              </Field>
            </FieldGroup>
            <FieldSeparator />
            <FieldGroup>
              <Field>
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
              <Field>
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
                  <Field>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
        <FieldSet>
          <FieldLegend className="py-2 text-lg">連繫</FieldLegend>
          {!accounts
            ? <Spinner />
            : (
                <FieldGroup>
                  <Item>
                    <ItemMedia variant="icon">
                      <DiscordIcon />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Discord</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      {hasDiscordLinked
                        ? (
                            <Button
                              disabled={isUnlinkingDiscord}
                              onClick={() => unlinkDiscord()}
                              variant="outline"
                            >
                              {isUnlinkingDiscord && <Spinner />}
                              解除連接
                            </Button>
                          )
                        : (
                            <Button
                              onClick={() => {
                                void authClient.linkSocial({
                                  callbackURL: window.location.href,
                                  provider: 'discord',
                                });
                              }}
                            >
                              連接
                            </Button>
                          )}
                    </ItemActions>
                  </Item>
                </FieldGroup>
              )}
        </FieldSet>
      </div>
    </div>
  );
}
