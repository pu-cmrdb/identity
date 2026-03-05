'use client';

import { KeyRoundIcon, Trash2Icon } from 'lucide-react';

import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

import { CreatePasskeyButton } from '../_components/create-passkey-button';

export function PasskeysSection() {
  const { data: passkeys, isPending: isPasskeysLoading, refetch } = authClient.useListPasskeys();

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">密碼金鑰</h2>

        <CreatePasskeyButton onSuccess={() => void refetch()} />
      </div>

      <p className="text-muted-foreground">
        使用裝置的生物辨識或 PIN 碼登入，無需記憶密碼,更安全也更方便
      </p>

      <div className="my-4">
        {isPasskeysLoading
          ? <Spinner />
          : !passkeys?.length
              ? (
                  <Empty>
                    <EmptyMedia variant="icon">
                      <KeyRoundIcon />
                    </EmptyMedia>

                    <EmptyHeader>
                      <EmptyTitle>無密碼金鑰</EmptyTitle>

                      <EmptyDescription>
                        你還沒有任何密碼金鑰，點擊新增來建立一個
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )
              : (passkeys.map((key) => (
                  <Item key={key.id}>
                    <ItemMedia variant="icon">
                      <KeyRoundIcon />
                    </ItemMedia>

                    <ItemContent>
                      <ItemTitle>{key.name ?? '未命名密碼金鑰'}</ItemTitle>

                      <ItemDescription>
                        建立於
                        {key.createdAt.toLocaleString('zh-TW', { dateStyle: 'long', timeStyle: 'short' })}
                      </ItemDescription>
                    </ItemContent>

                    <ItemActions>
                      <Button size="icon" variant="destructive">
                        <Trash2Icon />
                      </Button>
                    </ItemActions>
                  </Item>
                )))}
      </div>
    </section>
  );
}
