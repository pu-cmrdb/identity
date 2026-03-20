'use client';

import { CircleXIcon } from 'lucide-react';

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

export function InsufficientPermission() {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <CircleXIcon />
      </EmptyMedia>

      <EmptyHeader>
        <EmptyTitle>權限不足</EmptyTitle>

        <EmptyDescription>你沒有權限訪問這個頁面</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
