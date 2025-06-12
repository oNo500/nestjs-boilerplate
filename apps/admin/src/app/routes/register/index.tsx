import { Link, useNavigate } from 'react-router';
import ReactIcon from '@repo/icons/react.svg?react';

import { paths } from '@/config/paths';
import RegisterForm from '@/features/auth/components/register-form';

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <Link to="/" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex items-center justify-center rounded-md text-6xl">
              <ReactIcon />
            </div>
            <span className="sr-only">React Boilerplate</span>
          </Link>
          <div className="text-secondary-foreground text-sm">Create your account.</div>
        </div>
        <RegisterForm
          onSuccess={() => {
            navigate(paths.home.getHref());
          }}
        />
        <div className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link to={paths.auth.login.getHref()} className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
