import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/server/auth';

import {
  AuthorizeAdminAccountProhibitedError,
  AuthorizeInvalidClientError,
} from './_components/error';
import { AuthorizeConfirmation } from './_components/confirmation';

export default async function AuthorizePage({
  searchParams,
}: PageProps<'/oauth2/authorize'>) {
  const { client_id: clientId, scope } = await searchParams;
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    // we should already have session here
    redirect('/login');
  }

  if (session.user.username === 'cmrdb_admin') {
    return <AuthorizeAdminAccountProhibitedError />;
  }

  if (typeof clientId !== 'string') {
    return <AuthorizeInvalidClientError />;
  }

  const client = await auth.api
    .getOAuthClientPublic({
      headers: headersList,
      query: {
        client_id: clientId,
      },
    })
    .catch((err) => console.error(err));
  if (!client) {
    return <AuthorizeInvalidClientError />;
  }

  return (
    <AuthorizeConfirmation
      client={client}
      scope={Array.isArray(scope) ? scope.join(' ') : scope}
      session={session}
    />
  );
}
