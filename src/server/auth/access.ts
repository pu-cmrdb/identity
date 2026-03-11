import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access';
import { ShieldUserIcon, User2Icon } from 'lucide-react';
import { createAccessControl } from 'better-auth/plugins';

import type { LucideIcon } from 'lucide-react';

export const ac = createAccessControl({
  ...defaultStatements,
});

const admin = ac.newRole({
  ...adminAc.statements,
});

const user = ac.newRole({
  ...userAc.statements,
});

export const roles = {
  admin,
  user,
};

interface RoleMetadata {
  description: string;
  icon: LucideIcon;
  name: string;
}

export const metadata = {
  admin: {
    description: '擁有成員管理權限',
    icon: ShieldUserIcon,
    name: '管理員',
  } as RoleMetadata,
  user: {
    description: '擁有基本權限',
    icon: User2Icon,
    name: '使用者',
  } as RoleMetadata,
};
