import { Separator } from '@repo/ui/components/separator';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
import { Link } from 'react-router';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';
import GithubIcon from '@repo/icons/github.svg?react';

import ThemeToggle from '@/components/layouts/base-layout/theme-toggle';
import { paths } from '@/config/paths';

const Header = ({ title }: { title: string }) => {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to={paths.home.getHref()}>Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4 px-4">
        <Link to={paths.github.path} target="_blank">
          <GithubIcon />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
