'use client';

import { CircleCheckIcon, EllipsisIcon, LinkIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GravatarImage } from '@/components/gravatar';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

import type { OAuthClient } from '@better-auth/oauth-provider';

import type { Session } from '@/server/auth';

type AuthorizeConfirmationProps = Readonly<{
  client: OAuthClient;
  scope: string | undefined;
  session: Session;
}>;

export function AuthorizeConfirmation({ client, scope, session }: AuthorizeConfirmationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { isPending, mutate, variables } = useMutation({
    mutationFn: async (accept: boolean) => {
      const result = await authClient.oauth2.consent({
        accept,
        scope,
      });

      if (result.error) throw new Error(result.error.message ?? '發生錯誤');

      return result.data;
    },
    mutationKey: ['oauth', 'confirmation', client.client_id],
  });

  const logout = () => {
    const returnUrl = new URL('/oauth2/authorize', window.location.origin);
    searchParams.forEach((value, key) => {
      returnUrl.searchParams.set(key, value);
    });

    router.push(`/login?continue=${encodeURIComponent(returnUrl.toString())}`);
    void authClient.signOut();
  };

  const redirectUrl = new URL(decodeURIComponent(searchParams.get('redirect_uri')!));
  const scopes = scope?.split(' ') ?? [];
  const clientName = client.client_name ?? '未知應用程式';

  return (
    <div>
      <Card className="min-w-sm">
        <div className="mt-2 flex items-center justify-center gap-4">
          <Avatar className="size-16">
            <AvatarImage draggable={false} src={client.logo_uri} />

            <AvatarFallback>
              {clientName[0]}
            </AvatarFallback>
          </Avatar>

          <EllipsisIcon className="text-muted-foreground/60" />

          <Avatar className="size-16">
            <GravatarImage draggable={false} email={session.user.email} />

            <AvatarFallback>
              {session.user.name[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">{clientName}</CardTitle>

          <CardDescription className="text-base">想要存取您的帳戶</CardDescription>

          <div className="text-sm text-muted-foreground/60">
            以
            <span className="px-1 font-medium">{session.user.name}</span>
            登入

            <Button
              className="px-1"
              onClick={logout}
              variant="link"
            >
              不是你嗎？
            </Button>
          </div>
        </CardHeader>

        <div className="px-8"><Separator /></div>

        <CardContent className="space-y-4">
          <div className="text-sm font-medium text-muted-foreground">
            這將會允許
            {clientName}
            ：
          </div>

          {scopes.length > 0 && (
            <ul className="
              space-y-2 py-2
              [&>li]:flex [&>li]:gap-2
            "
            >
              {scopes.includes('openid') && (
                <li>
                  <CircleCheckIcon className="text-emerald-500" />
                  驗證你的身分
                </li>
              )}

              {scopes.includes('profile') && (
                <li>
                  <CircleCheckIcon className="text-emerald-500" />
                  存取你的基本個人資料
                </li>
              )}

              {scopes.includes('email') && (
                <li>
                  <CircleCheckIcon className="text-emerald-500" />
                  存取你的電子郵件地址
                </li>
              )}
            </ul>
          )}

          <div className="text-xs text-muted-foreground/40">
            <ul className="
              space-y-2
              [&>li]:flex [&>li]:gap-1
            "
            >
              <li>
                <LinkIcon size={16} />
                當你接受後，你將會被重新導向至

                <span className="font-medium">
                  {redirectUrl.protocol}
                  &#47;&#47;

                  {redirectUrl.host}
                </span>
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="justify-between">
          <Button
            disabled={isPending}
            onClick={() => { mutate(false); }}
            variant="outline"
          >
            {isPending && !variables && <Spinner />}
            取消
          </Button>

          <Button
            disabled={isPending}
            onClick={() => { mutate(true); }}
          >
            {isPending && variables && <Spinner />}
            同意
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
