'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@workspace/ui/components/sidebar'
import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

type SubItem = { title: string, url: string, isActive?: boolean }

type NavItem = {
  title: string
  url: string
  icon?: React.ElementType
  isActive?: boolean
  items?: SubItem[]
}

function NavMainItemsMap({ item }: { item: NavItem & { items: SubItem[] } }) {
  const [open, setOpen] = useState(!!item.isActive)

  return (
    <Collapsible
      key={item.title}
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} />}
      >
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton isActive={subItem.isActive} render={<Link href={subItem.url} />}>
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function NavMain({
  label,
  items,
}: {
  label: string
  items: NavItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="uppercase tracking-wider">{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items && item.items.length > 0
            ? <NavMainItemsMap key={item.title} item={{ ...item, items: item.items }} />
            : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={item.isActive} tooltip={item.title} render={<Link href={item.url} />}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
