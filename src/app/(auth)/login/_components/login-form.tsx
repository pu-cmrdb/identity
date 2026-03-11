'use client';

import { EyeIcon, EyeOffIcon, KeyRoundIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { BetterAuthError } from 'better-auth';
import { SiDiscord as DiscordIcon } from '@icons-pack/react-simple-icons';
import { arktypeResolver } from '@hookform/resolvers/arktype';
import { type } from 'arktype';

import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

/**
 * 登入表單資料驗證結構
 *
 * 定義使用者登入時必須提供的電子郵件與密碼格式要求。
 * 電子郵件必須為有效格式，密碼長度至少 8 個字元。
 */
const LoginFormSchema = type({
  identifier: type.string
    .atLeastLength(1)
    .configure({ message: '請輸入有效的電子郵件地址或使用者名稱' })
    .narrow((value, ctx) =>
      !value.includes('@') || (type.keywords.string.email.allows(value) || ctx.reject({ message: '請輸入有效的電子郵件' })),
    ),
  password: type.string
    .atLeastLength(8)
    .configure({ message: '密碼至少需要 8 個字元' }),
  rememberMe: type.boolean,
});
type LoginFormSchema = typeof LoginFormSchema.infer;

/**
 * 提供使用者電子郵件登入功能的表單元件
 *
 * 此元件包含電子郵件與密碼輸入欄位，並提供密碼顯示/隱藏切換功能。
 * 表單資料會透過 arktype 進行即時驗證，確保輸入格式正確後才能提交。
 *
 * @returns 完整的登入表單介面，包含驗證與錯誤訊息顯示
 */
export function LoginForm() {
  const [obfuscatePassword, setObfuscatePassword] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get('callbackUrl') ?? searchParams.get('continue') ?? '/';

  const form = useForm<LoginFormSchema>({
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
    resolver: arktypeResolver(LoginFormSchema),
  });

  const { isPending: isPasskeyPending, refetch } = useQuery({
    enabled: false,
    queryFn: () => authClient.signIn.passkey({
      autoFill: true,
      fetchOptions: {
        onSuccess() {
          router.push(callbackURL);
        },
      },
    }),
    queryKey: ['passkey'],
  });

  const { isPending: isSignInPending, mutate } = useMutation({
    mutationFn: async (values: LoginFormSchema) => {
      const isEmail = values.identifier.includes('@');

      let result;

      if (isEmail) {
        result = await authClient.signIn.email({
          callbackURL,
          email: values.identifier,
          password: values.password,
        });
      }
      else {
        result = await authClient.signIn.username({
          callbackURL,
          password: values.password,
          username: values.identifier,
        });
      }

      if (result.error) {
        throw new BetterAuthError(result.error.message ?? 'Unknown Error');
      }
    },
    onError(error, values) {
      const isEmail = values.identifier.includes('@');

      if (error instanceof BetterAuthError) {
        if (isEmail) {
          form.setError('identifier', { message: '電子郵件或密碼不正確' });
          form.setError('password', { message: '電子郵件或密碼不正確' });
        }
        else {
          form.setError('identifier', { message: '使用者名稱或密碼不正確' });
          form.setError('password', { message: '使用者名稱或密碼不正確' });
        }

        return;
      }

      form.setError('identifier', { message: `發生未知錯誤，請稍後再試一次 ${error}` });
      form.setError('password', { message: `發生未知錯誤，請稍後再試一次 ${error.message}` });
    },
    onSuccess() {
      router.replace(callbackURL);
    },
  });

  const submit = form.handleSubmit((values) => {
    mutate(values);
  });

  const onSubmit: React.SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void submit(event);
  };

  // 預載入 Passkey 選項
  useEffect(() => {
    const preloadPasskey = async () => {
      try {
        if (!await PublicKeyCredential.isConditionalMediationAvailable()) return;

        await refetch();
      }
      catch (error) {
        console.error('無法使用 Passkey', error);
      }
    };

    void preloadPasskey();
  }, [refetch]);

  return (
    <form onSubmit={onSubmit}>
      <FieldSet>
        <FieldGroup>
          <Controller
            control={form.control}
            name="identifier"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  電子郵件或使用者名稱
                </FieldLabel>

                <Input
                  aria-invalid={fieldState.invalid}
                  autoComplete="email username webauthn"
                  id={field.name}
                  required
                  type="text"
                  {...field}
                />

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  密碼
                </FieldLabel>

                <InputGroup>
                  <InputGroupInput
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password webauthn"
                    id={field.name}
                    required
                    type={obfuscatePassword ? 'password' : 'text'}
                    {...field}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={() => {
                        setObfuscatePassword(!obfuscatePassword);
                      }}
                    >
                      {obfuscatePassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  checked={field.value}
                  id={field.name}
                  onCheckedChange={field.onChange}
                />

                <FieldLabel htmlFor={field.name}>
                  記住我
                </FieldLabel>
              </Field>
            )}
          />
        </FieldGroup>

        <Field>
          <Button
            disabled={isSignInPending}
            type="submit"
          >
            {isSignInPending ? <Spinner /> : null}

            <span>登入</span>
          </Button>
        </Field>

        <FieldSeparator>
          或使用
        </FieldSeparator>

        <Field>
          <Button
            disabled={isPasskeyPending}
            onClick={() => {
              void refetch();
            }}
            type="button"
            variant="outline"
          >
            {isPasskeyPending ? <Spinner /> : <KeyRoundIcon />}

            <span>
              Passkey
            </span>
          </Button>

          <Button
            className={`
              bg-[#5865F2] text-white
              hover:bg-[#454FBF] hover:text-white
            `}
            onClick={() => {
              void authClient.signIn.social({
                provider: 'discord',
              });
            }}
            type="button"
            variant="outline"
          >
            <DiscordIcon />

            <span>
              Discord
            </span>
          </Button>
        </Field>
      </FieldSet>
    </form>
  );
}
