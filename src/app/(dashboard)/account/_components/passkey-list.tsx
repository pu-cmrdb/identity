'use client';

import { CircleXIcon, KeyRoundIcon, Trash2Icon } from 'lucide-react';

import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

export function PasskeyList() {
  const { data, error, isPending } = authClient.useListPasskeys();

  if (isPending) {
    return (
      <Empty>
        <EmptyMedia>
          <Spinner className="size-8" />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyDescription>載入中，請稍候...</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <CircleXIcon />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle>無法載入密碼金鑰</EmptyTitle>

          <EmptyDescription>{error.message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data?.length) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <KeyRoundIcon />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle>無密碼金鑰</EmptyTitle>

          <EmptyDescription>你還沒有任何密碼金鑰，點擊新增來建立一個</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return data.map((key) => (
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
  ));
}
