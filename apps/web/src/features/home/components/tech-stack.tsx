import { cn } from '@repo/ui/lib/utils';
import NextLogo from '@repo/icons/nextdotjs.svg';
import ReactLogo from '@repo/icons/react.svg';
import ShadcnLogo from '@repo/icons/shadcnui.svg';
import TailwindLogo from '@repo/icons/tailwindcss.svg';
import TurborepoLogo from '@repo/icons/turborepo.svg';
import ReactRouterLogo from '@repo/icons/reactrouter.svg';
import ViteLogo from '@repo/icons/vite.svg';
import VitestLogo from '@repo/icons/vitest.svg';
import PrettierLogo from '@repo/icons/prettier.svg';
import EslintLogo from '@repo/icons/eslint.svg';
import TypeScriptLogo from '@repo/icons/typescript.svg';
import ZustandLogo from '@repo/icons/zustand.svg';
import ReactQueryLogo from '@repo/icons/reactquery.svg';
import ReactHookFormLogo from '@repo/icons/reacthookform.svg';
import MswLogo from '@repo/icons/msw.svg';
import PlaywrightLogo from '@repo/icons/playwright.svg';
import StorybookLogo from '@repo/icons/storybook.svg';

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
  {
    name: 'Storybook',
    logo: <StorybookLogo />,
  },
];

const TechStack = ({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) => {
  return (
    <div
      className={cn('bg-muted text-primary absolute bottom-0 left-0 right-0 flex h-fit flex-col', className)}
      {...props}
    >
      <div className="overflow-hidden px-4 py-3">
        <div className="animate-tech-scroll-left tech-scroll-animate flex w-max gap-12">
          {[...techs, ...techs].map((tech, idx) => (
            <div key={tech.name + idx} className="flex min-w-fit flex-row items-center gap-3">
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
