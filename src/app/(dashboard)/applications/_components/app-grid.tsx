'use client';

import { CircleXIcon, ExternalLinkIcon, ShapesIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

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
      <Empty className="min-h-64">
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
      <Empty className="min-h-64">
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
      <Empty className="min-h-64">
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
    <div className="divide-y border-y">
      {data.map((app) => (
        <Link
          className="flex items-start justify-between gap-4 px-2 py-6 transition-colors hover:bg-muted/40"
          href={`/application/${app.client_id}`}
          key={app.client_id}
        >
          <div className="min-w-0 space-y-3">
            <div>
              <h2 className="truncate font-medium text-lg">
                {app.client_name || '未命名應用程式'}
              </h2>
              <p className="font-mono text-muted-foreground text-xs">
                {app.client_id}
              </p>
            </div>

            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                {app.redirect_uris.length} 個重新導向 URI
              </p>
              {app.redirect_uris.slice(0, 2).map((uri) => (
                <p
                  className="flex min-w-0 items-center gap-1 truncate"
                  key={uri}
                >
                  <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">{uri}</span>
                </p>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
