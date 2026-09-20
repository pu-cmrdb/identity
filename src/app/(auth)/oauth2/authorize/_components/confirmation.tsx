'use client';

import { CircleCheckIcon, EllipsisIcon, LinkIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

const SCOPE_DESCRIPTIONS: Record<string, string> = {
  email: '存取你的電子郵件地址',
  offline_access: '在你離線時持續存取已授權的資料',
  openid: '驗證你的身分',
  profile: '存取你的基本個人資料',
};

export function AuthorizeConfirmation({
  client,
  scope,
  session,
}: AuthorizeConfirmationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { isPending, mutate, variables } = useMutation({
    mutationFn: async (accept: boolean) => {
      const result = await authClient.oauth2.consent({
        accept,
        scope,
      });

      if (result.error) {
        throw new Error(result.error.message ?? '發生錯誤');
      }

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

  const redirectUri = searchParams.get('redirect_uri');
  if (!redirectUri) {
    return null;
  }

  const redirectUrl = new URL(decodeURIComponent(redirectUri));
  const scopes = [...new Set(scope?.trim().split(/\s+/).filter(Boolean) ?? [])];
  const clientName = client.client_name ?? '未知應用程式';

  return (
    <div>
      <Card className="min-w-sm">
        <div className="mt-2 flex items-center justify-center gap-4">
          <Avatar className="size-16">
            <AvatarImage draggable={false} src={client.logo_uri} />

            <AvatarFallback>{clientName[0]}</AvatarFallback>
          </Avatar>

          <EllipsisIcon className="text-muted-foreground/60" />

          <Avatar className="size-16">
            <AvatarImage
              draggable={false}
              src={`/api/user/${session.user.id}/image`}
            />

            <AvatarFallback>{session.user.name[0]}</AvatarFallback>
          </Avatar>
        </div>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">{clientName}</CardTitle>

          <CardDescription className="text-base">
            想要存取你的帳號
          </CardDescription>

          <div className="text-muted-foreground/60 text-sm">
            以<span className="px-1 font-medium">{session.user.name}</span>
            登入
            <Button className="px-1" onClick={logout} variant="link">
              不是你嗎？
            </Button>
          </div>
        </CardHeader>

        <div className="px-8">
          <Separator />
        </div>

        <CardContent className="space-y-4">
          <div className="font-medium text-muted-foreground text-sm">
            這將會允許
            {clientName}：
          </div>

          {scopes.length > 0 && (
            <ul className="space-y-2 py-2">
              {scopes.map((requestedScope) => (
                <li className="flex items-start gap-2" key={requestedScope}>
                  <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <span>
                    {SCOPE_DESCRIPTIONS[requestedScope]
                      ?? `使用「${requestedScope}」權限`}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="text-muted-foreground/40 text-xs">
            <ul className="space-y-2 [&>li]:flex [&>li]:gap-1">
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
            onClick={() => {
              mutate(false);
            }}
            variant="outline"
          >
            {isPending && !variables && <Spinner />}
            取消
          </Button>

          <Button
            disabled={isPending}
            onClick={() => {
              mutate(true);
            }}
          >
            {isPending && variables && <Spinner />}
            同意
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
