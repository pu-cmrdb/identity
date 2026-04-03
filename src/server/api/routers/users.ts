import { TRPCError } from '@trpc/server';
import { count } from 'drizzle-orm';
import { type } from 'arktype';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { db, schema } from '@/server/database';

export const usersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(type({
      'cursor?': 'number',
      'limit?': '0 <= number <= 100',
    }).pipe((v) => ({
      limit: v.limit ?? 10,
      offset: v.cursor ?? 0,
    })))
    .query(async ({ input }) => {
      try {
        const result = (await db.query.users.findMany({
          limit: input.limit,
          offset: input.offset,
        })).map((v) => ({
          banExpires: v.banExpires,
          banned: v.banned ?? false,
          banReason: v.banReason,
          createdAt: v.createdAt,
          displayUsername: v.displayUsername,
          email: v.email,
          emailVerified: v.emailVerified,
          id: v.id,
          name: v.name,
          role: v.role ?? 'user',
          updatedAt: v.updatedAt,
          username: v.username ?? '',
        }));

        const [t] = await db.select({ count: count() }).from(schema.users);

        const perPage = input.limit;
        const totalItems = t?.count ?? 0;
        const totalPages = Math.ceil(totalItems / perPage);
        const currentCursor = input.offset;
        const currentPage = Math.floor(input.offset / perPage);
        const hasNextPage = (input.offset + input.limit) < totalItems;
        const nextCursor = hasNextPage ? input.offset + perPage : null;
        const hasPreviousPage = input.offset > 0;

        return {
          data: result,
          meta: {
            currentCursor,
            currentPage,
            hasNextPage,
            hasPreviousPage,
            nextCursor,
            perPage,
            totalItems,
            totalPages,
          },
        };
      }
      catch (error) {
        // this should not happen
        console.error(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve data from database',
        });
      }
    }),
});
