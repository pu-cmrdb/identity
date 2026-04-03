'use client';

import { authClient } from '@/server/auth/client';

import { CreatePasskeyButton } from '../_components/create-passkey-button';
import { PasskeyList } from '../_components/passkey-list';

export function PasskeysSection() {
  const { refetch } = authClient.useListPasskeys();

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">密碼金鑰</h2>

        <CreatePasskeyButton onSuccess={() => void refetch()} />
      </div>

      <p className="text-muted-foreground">
        使用裝置的生物辨識或 PIN 碼登入，無需記憶密碼，更安全也更方便
      </p>

      <div className="my-4">
        <PasskeyList />
      </div>
    </section>
  );
}
