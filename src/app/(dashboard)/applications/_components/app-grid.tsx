'use client';

import { CircleXIcon, ShapesIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { authClient } from '@/server/auth/client';

export function ApplicationGrid() {
  const { data, error, isPending } = useQuery({
    queryFn: async () => {
      const result = await authClient.oauth2.getClients();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    queryKey: ['authClient.oauth2.getClients'],
  });

  if (isPending) {
    return (
      <Spinner />
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleXIcon />
          </EmptyMedia>

          <EmptyTitle>無法載入應用程式</EmptyTitle>

          <EmptyDescription>{error.message}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShapesIcon />
          </EmptyMedia>

          <EmptyTitle>無應用程式</EmptyTitle>

          <EmptyDescription>你還沒有任何應用程式，點擊建立應用程式來新增一個</EmptyDescription>
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
