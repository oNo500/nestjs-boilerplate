'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactIcon from '@repo/icons/react.svg';

import { useLogout } from '@/auth';
import { paths } from '@/config/paths';
import { useUser } from '@/hooks/use-user';
import { queryClient } from '@/lib/query-client';
import { apiClient } from '@/lib/api-client';

import ThemeToggle from './theme-toggle';

import type { APIResponse, User } from '@/types/api';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const { userData } = useUser();

  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['user'],
      queryFn: () =>
        apiClient.get<APIResponse<User>>('/api/auth/me', {
          cache: 'no-cache',
        }),
    });
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-background/80 fixed left-0 top-0 z-50 w-full backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl flex-nowrap items-center justify-between gap-4 whitespace-nowrap px-4 sm:px-6 lg:px-8">
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <ReactIcon className="h-8 w-8 flex-shrink-0" />
            <span className="hidden sm:block">React Boilerplate</span>
            <span className="block sm:hidden">React</span>
          </Link>
        </div>

        <div className="hidden flex-row items-center justify-end gap-4 md:flex">
          <ThemeToggle />
          {!userData ? (
            <Link
              href={paths.auth.login.getHref()}
              className="border-border hover:bg-accent rounded-full border px-3 py-1 transition-colors"
            >
              Login
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>{userData?.name}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="hover:bg-accent flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            <div className="space-y-1">
              <div
                className={`h-0.5 w-5 bg-current transition-transform ${
                  isMobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''
                }`}
              />
              <div
                className={`h-0.5 w-5 bg-current transition-opacity ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}
              />
              <div
                className={`h-0.5 w-5 bg-current transition-transform ${
                  isMobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {isMobileMenuOpen && (
        <div
          className={`bg-background/98 fixed left-0 right-0 z-40 backdrop-blur-md transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'} `}
          style={{
            top: '64px', // 导航栏高度
            height: 'calc(100vh - 64px)',
          }}
        >
          <div className="relative mx-auto h-full max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex h-full flex-col gap-3">{/* 这里可以放菜单项 */}</div>
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
