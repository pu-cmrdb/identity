'use client';

import { CheckIcon, CopyIcon, RefreshCwIcon } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

const SCOPES = [
  { description: '取得使用者的基本身分資訊', label: 'openid', value: 'openid' },
  { description: '讀取使用者名稱與頭像', label: 'profile', value: 'profile' },
  { description: '讀取使用者電子郵件', label: 'email', value: 'email' },
  {
    description: '取得更新 Token 所需的 refresh token',
    label: 'offline_access',
    value: 'offline_access',
  },
];

type OAuthUrlGeneratorProps = {
  redirectUris: string[];
  clientId: string;
};

type PkcePair = {
  challenge: string;
  state: string;
  verifier: string;
};

function randomBase64Url(byteLength: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');
}

async function createPkcePair(): Promise<PkcePair> {
  const verifier = randomBase64Url(32);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');

  return { challenge, state: randomBase64Url(16), verifier };
}

export function OAuthUrlGenerator({
  clientId,
  redirectUris,
}: OAuthUrlGeneratorProps) {
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => '',
  );
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['openid']);
  const [redirectUri, setRedirectUri] = useState(redirectUris[0] ?? '');
  const [pkce, setPkce] = useState<PkcePair | null>(null);
  const [copiedField, setCopiedField] = useState<'url' | 'verifier'>();

  const regeneratePkce = async () => {
    setPkce(await createPkcePair());
    setCopiedField(undefined);
  };

  const authorizationUrl = useMemo(() => {
    if (!(origin && pkce)) {
      return '';
    }

    const params = new URLSearchParams({
      client_id: clientId,
      code_challenge: pkce.challenge,
      code_challenge_method: 'S256',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: selectedScopes.join(' '),
      state: pkce.state,
    });
    return `${origin}/api/auth/oauth2/authorize?${params.toString()}`;
  }, [clientId, origin, pkce, redirectUri, selectedScopes]);
  const codeVerifier = pkce ? pkce.verifier : '';

  const toggleScope = (scope: string, checked: boolean) => {
    setSelectedScopes((current) =>
      checked
        ? [...current, scope]
        : current.filter((selectedScope) => selectedScope !== scope),
    );
    setCopiedField(undefined);
  };

  const copyValue = async (
    value: string,
    field: 'url' | 'verifier',
    message: string,
  ) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success(message);
  };

  return (
    <section className="mt-12 border-t pt-10">
      <div className="mb-6">
        <h2 className="font-semibold text-2xl tracking-tight">
          OAuth2 URL 產生器
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          選擇應用程式需要的 scope 與重新導向
          URI，產生可分享給使用者的授權連結。
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <p className="font-medium text-sm">Scopes</p>
          <div className="grid gap-x-8 gap-y-3 border-y bg-muted/30 px-4 py-4 sm:grid-cols-2">
            {SCOPES.map((scope) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
                htmlFor={`oauth-scope-${scope.value}`}
                key={scope.value}
              >
                <Checkbox
                  checked={selectedScopes.includes(scope.value)}
                  id={`oauth-scope-${scope.value}`}
                  onCheckedChange={(checked) =>
                    toggleScope(scope.value, checked)
                  }
                />
                <span className="min-w-0">
                  <span className="block font-medium text-sm">
                    {scope.label}
                  </span>
                  <span className="block text-muted-foreground text-xs">
                    {scope.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-medium text-sm" htmlFor="oauth-redirect-uri">
            重新導向 URI
          </label>
          <NativeSelect
            className="w-full"
            id="oauth-redirect-uri"
            onChange={(event) => {
              setRedirectUri(event.target.value);
              setCopiedField(undefined);
            }}
            value={redirectUri}
          >
            {redirectUris.map((uri) => (
              <NativeSelectOption key={uri} value={uri}>
                {uri}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-sm">PKCE Code Verifier</p>
              <p className="mt-1 text-muted-foreground text-xs">
                請由應用程式暫時保存，並在交換 Token 時以 code_verifier 傳送。
              </p>
            </div>
            <Button
              onClick={() => void regeneratePkce()}
              size="sm"
              type="button"
              variant="outline"
            >
              <RefreshCwIcon />
              {pkce ? '重新產生' : '產生 PKCE'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              className="h-11 min-w-0 flex-1 select-all rounded-xl font-sans text-sm"
              readOnly
              value={codeVerifier || '請先產生 PKCE'}
            />
            <Button
              aria-label="複製 PKCE Code Verifier"
              disabled={!codeVerifier}
              onClick={() =>
                void copyValue(codeVerifier, 'verifier', 'Code Verifier 已複製')
              }
              size="icon"
              type="button"
              variant={copiedField === 'verifier' ? 'secondary' : 'outline'}
            >
              {copiedField === 'verifier' ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-sm">產生的授權 URL</p>
          <div className="flex gap-2">
            <Input
              className="h-11 min-w-0 flex-1 select-all rounded-xl font-sans text-sm"
              readOnly
              value={authorizationUrl || '請先產生 PKCE'}
            />
            <Button
              aria-label="複製 OAuth URL"
              disabled={!authorizationUrl}
              onClick={() =>
                void copyValue(authorizationUrl, 'url', 'OAuth URL 已複製')
              }
              size="icon"
              type="button"
              variant={copiedField === 'url' ? 'secondary' : 'default'}
            >
              {copiedField === 'url' ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
