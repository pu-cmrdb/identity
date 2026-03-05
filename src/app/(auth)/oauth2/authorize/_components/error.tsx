'use client';

import { CircleXIcon } from 'lucide-react';

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Card } from '@/components/ui/card';

export function AuthorizeAdminAccountProhibitedError() {
  return (
    <div>
      <Card>
        <Empty>
          <EmptyMedia variant="icon">
            <CircleXIcon />
          </EmptyMedia>

          <EmptyHeader>
            <EmptyTitle>無效的帳號</EmptyTitle>

            <EmptyDescription>系統管理員帳號無法用於第三方應用程式授權</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    </div>
  );
}

export function AuthorizeInvalidClientError() {
  return (
    <div>
      <Card>
        <Empty>
          <EmptyMedia variant="icon">
            <CircleXIcon />
          </EmptyMedia>

          <EmptyHeader>
            <EmptyTitle>無效的應用程式</EmptyTitle>

            <EmptyDescription>請稍後再試一次</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Card>
    </div>
  );
}
