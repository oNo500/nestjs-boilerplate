'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactIcon from '@repo/icons/react.svg';

import { paths } from '@/config/paths';
import RegisterForm from '@/features/auth/components/register-form';

const RegisterPage = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex items-center justify-center rounded-md text-6xl">
              <ReactIcon />
            </div>
            <span className="sr-only">React Boilerplate</span>
          </Link>
          <div className="text-secondary-foreground text-sm">Create your account.</div>
        </div>
        <RegisterForm
          onSuccess={async () => {
            router.push(paths.home.getHref());
          }}
        />
        <div className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href={paths.auth.login.getHref()} className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
