import Image from 'next/image';
import Link from 'next/link';

import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

import { SidebarMain } from './main';

export function DashboardSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={(
                  <Link className="flex items-center gap-1" href="/">
                    <Image
                      alt="行雲身份管理系統"
                      height={36}
                      src="/iam.png"
                      width={36}
                    />

                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">行雲者研發基地</span>

                      <span className="text-base">身份管理系統</span>
                    </div>
                  </Link>
                )}
                size="lg"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarMain />
      </SidebarContent>
    </Sidebar>
  );
}
