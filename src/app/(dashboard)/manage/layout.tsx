import { headers } from 'next/headers';

import { auth } from '@/server/auth';

import { InsufficientPermission } from '../_components/error';

export default async function DashBoardManageLayout({
  children,
}: LayoutProps<'/manage'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== 'admin') {
    return <InsufficientPermission />;
  }

  return children;
}
