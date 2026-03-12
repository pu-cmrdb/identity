import { forbidden } from 'next/navigation';
import { headers } from 'next/headers';

import { auth } from '@/server/auth';

export default async function DashBoardManageLayout({ children }: LayoutProps<'/manage'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== 'admin') forbidden();

  return children;
}
