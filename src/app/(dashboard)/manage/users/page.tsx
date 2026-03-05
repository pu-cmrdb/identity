'use client';

import { useInfiniteQuery } from '@tanstack/react-query';

import { Spinner } from '@/components/ui/spinner';
import { useTRPC } from '@/trpc/react';

import { CreateUserButton, UserItem } from './_components';

export default function DashboardManageUsersPage() {
  const trpc = useTRPC();

  const { data, isPending } = useInfiniteQuery(trpc.users.list.infiniteQueryOptions(
    {
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
    },
  ));

  return (
    <div className="
      space-y-4 p-4
      md:p-8
      xl:p-16
    "
    >
      <div className="space-y-4 p-4">
        <h1 className="text-2xl">管理使用者</h1>

        <div className="flex items-center justify-between">
          <div>
            {(isPending || !data) ? <Spinner /> : `共有 ${data.pages[0]?.meta.totalItems} 個使用者`}
          </div>

          <div>
            <CreateUserButton />
          </div>
        </div>
      </div>

      <div>
        {data?.pages.map((page) =>
          page.data.map((user) => <UserItem key={user.id} user={user} />),
        )}
      </div>

    </div>
  );
}
