'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { authClient } from '@/server/auth/client';
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

import {
  type OAuthApplicationType,
  validateOAuthRedirectUri,
} from '@/lib/oauth-redirect-uri';
import { ApplicationIconUpload } from './_components/application-icon-upload';
import { OAuthUrlGenerator } from './_components/oauth-url-generator';

type RotateClientSecretResult = { client_secret?: string };
type RedirectUriField = { id: string; value: string };

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [name, setName] = useState<string | undefined>();
  const [redirectUriFields, setRedirectUriFields] = useState<
    RedirectUriField[] | undefined
  >();
  const [redirectUriError, setRedirectUriError] = useState<{
    index: number;
    message: string;
  } | null>(null);
  const [isSavingApplication, setIsSavingApplication] = useState(false);
  const queryClient = useQueryClient();

  const { data, error, isPending } = useQuery({
    queryFn: async () => {
      const result = await authClient.oauth2.getClients();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data.find((client) => client.client_id === id) ?? null;
    },
    queryKey: ['authClient.oauth2.getClients', id],
  });

  const saveApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = (name ?? data?.client_name ?? '').trim();
    if (!nextName) {
      toast.error('應用程式名稱不可為空白');
      return;
    }

    const applicationType: OAuthApplicationType =
      data?.type === 'native' ? 'native' : 'web';
    const nextRedirectUris = (
      redirectUriFields?.map(({ value }) => value)
      ?? data?.redirect_uris
      ?? []
    ).map((uri) => uri.trim());
    if (!nextRedirectUris.length) {
      toast.error('至少需要一個重新導向 URI');
      return;
    }
    const invalidIndex = nextRedirectUris.findIndex((uri) =>
      validateOAuthRedirectUri(uri, applicationType),
    );
    if (invalidIndex >= 0) {
      setRedirectUriError({
        index: invalidIndex,
        message:
          validateOAuthRedirectUri(
            nextRedirectUris[invalidIndex] ?? '',
            applicationType,
          ) ?? '無效的重新導向 URI',
      });
      return;
    }

    setIsSavingApplication(true);
    const result = await authClient.oauth2.updateClient({
      client_id: id,
      update: {
        client_name: nextName,
        redirect_uris: nextRedirectUris,
      },
    });

    if (result.error) {
      toast.error('更新應用程式名稱時發生錯誤', {
        description: result.error.message,
      });
      setIsSavingApplication(false);
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: ['authClient.oauth2.getClients'],
    });
    setName(nextName);
    setRedirectUriFields(
      nextRedirectUris.map((value) => ({
        id: crypto.randomUUID(),
        value,
      })),
    );
    setRedirectUriError(null);
    setIsSavingApplication(false);
    toast.success('應用程式設定已更新');
  };

  const resetToken = async () => {
    setIsResetting(true);
    const result = await authClient.$fetch('/oauth2/client/rotate-secret', {
      body: { client_id: id },
      method: 'POST',
    });

    if (result.error) {
      toast.error('重設 Token 時發生錯誤', {
        description: result.error.message,
      });
      setIsResetting(false);
      return;
    }

    setToken(
      (result.data as RotateClientSecretResult | null)?.client_secret ?? null,
    );
    setIsResetting(false);
    setIsResetDialogOpen(false);
    toast.success('Token 重設成功');
  };

  if (isPending) {
    return (
      <Empty className="min-h-[calc(100vh-4rem)]">
        <EmptyMedia>
          <Spinner className="size-8" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyDescription>載入中，請稍候...</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (error || !data) {
    return (
      <Empty className="min-h-[calc(100vh-4rem)]">
        <EmptyHeader>
          <EmptyTitle>
            {error ? '無法載入應用程式' : '找不到應用程式'}
          </EmptyTitle>
          <EmptyDescription>
            {error?.message ?? '這個應用程式不存在，或你沒有存取權限。'}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const currentName = name ?? data.client_name ?? '';
  const applicationType: OAuthApplicationType =
    data.type === 'native' ? 'native' : 'web';
  const currentRedirectUriFields =
    redirectUriFields
    ?? data.redirect_uris.map((value) => ({ id: `existing:${value}`, value }));
  const currentRedirectUris = currentRedirectUriFields.map(
    ({ value }) => value,
  );
  const isApplicationUnchanged =
    currentName.trim() === (data.client_name ?? '').trim()
    && JSON.stringify(currentRedirectUris)
      === JSON.stringify(data.redirect_uris);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
        <Link
          className="mb-10 inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
          href="/applications"
        >
          <ArrowLeftIcon className="size-4" />
          返回應用程式
        </Link>

        <header className="mb-10">
          <p className="mb-2 font-medium text-muted-foreground text-sm">
            {currentName || '未命名應用程式'}
          </p>
          <h1 className="font-semibold text-3xl tracking-tight">一般資訊</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            設定應用程式名稱、識別資訊，以及 OAuth 授權完成後允許返回的網址。
          </p>
        </header>

        <form className="space-y-8" onSubmit={saveApplication}>
          <ApplicationIconUpload
            clientId={data.client_id}
            clientName={currentName || '未命名應用程式'}
            logoUri={data.logo_uri}
          />

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="application-name">
              應用程式名稱
            </label>
            <Input
              className="h-11 rounded-xl"
              id="application-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="我的應用程式"
              value={currentName}
            />
            <p className="text-muted-foreground text-xs">
              這個名稱會在使用者授權應用程式時顯示。
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">應用程式類型</p>
            <Badge className="h-7 px-3" variant="secondary">
              {applicationType === 'native' ? '原生應用程式' : 'Web 應用程式'}
            </Badge>
            <p className="text-muted-foreground text-xs">
              應用程式類型建立後無法變更。原生應用程式可使用深度連結。
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">應用程式 ID</p>
            <div className="flex min-h-11 items-center rounded-lg bg-muted/60 px-3 py-2">
              <code className="select-all break-all text-sm">
                {data.client_id}
              </code>
            </div>
            <p className="text-muted-foreground text-xs">
              此應用程式在身份系統中的唯一識別碼。
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-sm">重新導向 URI</p>
            <div className="space-y-2">
              {currentRedirectUriFields.map((redirectUri, index) => (
                <div key={redirectUri.id}>
                  <div className="flex gap-2">
                    <Input
                      aria-invalid={redirectUriError?.index === index}
                      className="h-11 rounded-xl text-sm"
                      onChange={(event) => {
                        const nextFields = [...currentRedirectUriFields];
                        nextFields[index] = {
                          ...redirectUri,
                          value: event.target.value,
                        };
                        setRedirectUriFields(nextFields);
                        setRedirectUriError(null);
                      }}
                      placeholder={
                        applicationType === 'native'
                          ? 'com.example.app:/callback'
                          : 'https://example.com/oauth/callback'
                      }
                      value={redirectUri.value}
                    />
                    <Button
                      aria-label="移除重新導向 URI"
                      disabled={currentRedirectUriFields.length === 1}
                      onClick={() => {
                        setRedirectUriFields(
                          currentRedirectUriFields.filter(
                            ({ id: uriId }) => uriId !== redirectUri.id,
                          ),
                        );
                        setRedirectUriError(null);
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                  {redirectUriError?.index === index && (
                    <p className="mt-1 text-destructive text-xs">
                      {redirectUriError.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={() =>
                setRedirectUriFields([
                  ...currentRedirectUriFields,
                  { id: crypto.randomUUID(), value: '' },
                ])
              }
              size="sm"
              type="button"
              variant="outline"
            >
              <PlusIcon />
              新增 URI
            </Button>
            <p className="text-muted-foreground text-xs">
              {applicationType === 'native'
                ? '可使用 HTTPS、HTTP loopback URI，或 com.example.app:/callback 格式的深度連結。'
                : '使用 HTTPS；本機開發可使用 localhost、127.0.0.1 或 [::1] 的 HTTP URI。'}
            </p>
          </div>

          <div className="flex justify-end border-b pb-10">
            <Button
              disabled={
                isSavingApplication
                || isApplicationUnchanged
                || !currentName.trim()
              }
              type="submit"
            >
              {isSavingApplication && <Spinner />}
              儲存變更
            </Button>
          </div>
        </form>

        <section className="pt-10">
          <h2 className="font-semibold text-2xl tracking-tight">
            客戶端 Token
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Token 只會在重設成功後顯示一次。重設後，舊 Token 會立即失效。
          </p>

          <div className="mt-6 space-y-2">
            <p className="font-medium text-sm">Token</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-11 min-w-0 flex-1 items-center rounded-lg bg-muted/60 px-3 py-2">
                <code
                  className={
                    token
                      ? 'select-all break-all text-sm'
                      : 'text-muted-foreground text-sm'
                  }
                >
                  {token ?? '為了安全考量而隱藏'}
                </code>
              </div>
              <Button
                disabled={data.public || isResetting}
                onClick={() => setIsResetDialogOpen(true)}
                type="button"
                variant="destructive"
              >
                {isResetting && <Spinner />}
                重設 Token
              </Button>
            </div>
            {data.public && (
              <p className="text-muted-foreground text-xs">
                公開應用程式不能使用客戶端 Token。
              </p>
            )}
          </div>
        </section>

        <OAuthUrlGenerator
          clientId={data.client_id}
          redirectUris={currentRedirectUris}
        />
      </main>

      <AlertDialog onOpenChange={setIsResetDialogOpen} open={isResetDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>確認重設 Token？</AlertDialogTitle>
            <AlertDialogDescription>
              重設後，舊 Token 將立即失效。你需要將新的 Token
              更新到使用此應用程式的服務中。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={isResetting}
              onClick={() => void resetToken()}
              variant="destructive"
            >
              {isResetting && <Spinner data-icon="inline-start" />}
              確認重設
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
