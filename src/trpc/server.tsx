import 'server-only';

import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { createHydrationHelpers, createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { headers } from 'next/headers';

import { appRouter } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

import { createQueryClient } from './query-client';

import type { TRPCQueryOptions } from '@trpc/tanstack-react-query';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set('x-trpc-source', 'rsc');

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);

export const api = createTRPCOptionsProxy({
  ctx: createContext,
  queryClient: getQueryClient,
  router: appRouter,
});

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- expected any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  }
  else {
    void queryClient.prefetchQuery(queryOptions);
  }
}
