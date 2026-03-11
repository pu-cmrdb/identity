import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { db, schema } from '@/server/database';
import { hashEmail } from '@/lib/utils';

export async function GET({ params }: RouteContext<'/api/user/[id]/image'>) {
  const { id: userId } = await params;

  const result = await db.query.users.findFirst({
    columns: { email: true },
    where: eq(schema.users.id, userId),
  });

  if (!result) notFound();

  const hash = await hashEmail(result.email);

  redirect(`https://www.gravatar.com/avatar/${hash}?d=identicon`);
}
