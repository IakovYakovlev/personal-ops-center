'use client';

import * as React from 'react';
import { IconBook, IconLayoutDashboard } from '@tabler/icons-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useUser } from '@/lib/contexts/user-context';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { email } = useUser();
  const displayName = email ? email.split('@')[0].toUpperCase() : '';
  const initials = email ? email.slice(0, 2).toUpperCase() : '';

  const data = {
    user: {
      name: displayName,
      email: email,
      initials,
    },
    navMain: [
      {
        title: 'AI Document Intelligence',
        url: '/dashboard/documents',
        icon: IconBook,
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard">
                <IconLayoutDashboard className="size-5!" />
                <span className="text-base font-semibold">Personal Ops Center</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
