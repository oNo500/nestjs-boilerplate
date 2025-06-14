import { cn } from '@repo/ui/lib/utils';
import NextLogo from '@repo/icons/nextdotjs.svg?react';
import ReactLogo from '@repo/icons/react.svg?react';
import ShadcnLogo from '@repo/icons/shadcnui.svg?react';
import TailwindLogo from '@repo/icons/tailwindcss.svg?react';
import TurborepoLogo from '@repo/icons/turborepo.svg?react';
import ViteLogo from '@repo/icons/vite.svg?react';
import VitestLogo from '@repo/icons/vitest.svg?react';
import PrettierLogo from '@repo/icons/prettier.svg?react';
import EslintLogo from '@repo/icons/eslint.svg?react';
import TypeScriptLogo from '@repo/icons/typescript.svg?react';
import ZustandLogo from '@repo/icons/zustand.svg?react';
import ReactRouterLogo from '@repo/icons/reactrouter.svg?react';
import ReactQueryLogo from '@repo/icons/reactquery.svg?react';
import ReactHookFormLogo from '@repo/icons/reacthookform.svg?react';
import MswLogo from '@repo/icons/msw.svg?react';
import PlaywrightLogo from '@repo/icons/playwright.svg?react';

const techs = [
  {
    name: 'Turborepo',
    logo: <TurborepoLogo />,
  },
  {
    name: 'React 19',
    logo: <ReactLogo />,
  },
  {
    name: 'Next.js 15',
    logo: <NextLogo />,
  },
  {
    name: 'Tailwind CSS v4',
    logo: <TailwindLogo />,
  },
  {
    name: 'Shadcn UI',
    logo: <ShadcnLogo />,
  },
  {
    name: 'Vite',
    logo: <ViteLogo />,
  },
  {
    name: 'Vitest',
    logo: <VitestLogo />,
  },
  {
    name: 'Prettier',
    logo: <PrettierLogo />,
  },
  {
    name: 'Eslint',
    logo: <EslintLogo />,
  },
  {
    name: 'TypeScript',
    logo: <TypeScriptLogo />,
  },
  {
    name: 'Zustand',
    logo: <ZustandLogo />,
  },
  {
    name: 'React Router',
    logo: <ReactRouterLogo />,
  },
  {
    name: 'React Query',
    logo: <ReactQueryLogo />,
  },
  {
    name: 'React Hook Form',
    logo: <ReactHookFormLogo />,
  },
  {
    name: 'MSW',
    logo: <MswLogo />,
  },
  {
    name: 'Playwright',
    logo: <PlaywrightLogo />,
  },
];

const TechStack = ({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) => {
  return (
    <div className={cn('bg-muted text-primary absolute bottom-0 left-0 flex w-full flex-col', className)} {...props}>
      <div className="overflow-hidden px-4 py-3">
        <div className="tech-scroll-animate gap-12">
          {[...techs, ...techs].map((tech, idx) => (
            <div key={tech.name + idx} className="flex-0 flex min-w-fit flex-row items-center gap-3">
              <div className="duration-600 flex size-10 items-center justify-center text-3xl" title={tech.name}>
                {tech.logo}
              </div>
              <p className="text-sm">{tech.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStack;
