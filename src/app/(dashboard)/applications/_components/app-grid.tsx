'use client';

import { CircleXIcon, ShapesIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

export function ApplicationGrid() {
  const { data, error, isPending } = useQuery({
    queryFn: async () => {
      const result = await authClient.oauth2.getClients();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    queryKey: ['authClient.oauth2.getClients'],
  });

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
          <EmptyTitle>無法載入應用程式</EmptyTitle>

          <EmptyDescription>{error.message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data?.length) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <ShapesIcon />
        </EmptyMedia>

        <EmptyHeader>
          <EmptyTitle>無應用程式</EmptyTitle>

          <EmptyDescription>
            你還沒有任何應用程式，點擊建立來創建一個
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div>
      {data.map((app) => (
        <div key={app.client_id}>
          <div>{app.client_name}</div>
        </div>
      ))}
    </div>
  );
}
