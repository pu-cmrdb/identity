'use client';

import { ShapesIcon, UserIcon, UsersIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import Link from 'next/link';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSession } from '@/components/providers/session-provider';

export function SidebarMain() {
  const { user } = useSession();
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{user.name}</SidebarGroupLabel>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith('/account')}
              render={
                <Link href="/account">
                  <UserIcon />
                  帳號資訊
                </Link>
              }
            />
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith('/applications')}
              render={
                <Link href="/applications">
                  <ShapesIcon />
                  我的應用程式
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>行雲者研發基地</SidebarGroupLabel>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith('/manage/users')}
              render={
                <Link href="/manage/users">
                  <UsersIcon />
                  管理使用者
                </Link>
              }
            />
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === '/manage/applications'}
              render={
                <Link href="/manage/applications">
                  <ShapesIcon />
                  管理應用程式
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
