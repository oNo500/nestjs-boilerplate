import { Link } from 'react-router';
import { Button } from '@repo/ui/components/button';
import GithubIcon from '@repo/icons/github.svg?react';

const Hero = () => {
  return (
    <section className="relative mx-auto mt-24 flex max-w-3xl flex-col items-center justify-center gap-8 px-4 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full bg-gradient-to-br from-black/10 via-zinc-300/30 to-white/10 blur-3xl backdrop-blur-xl dark:from-white/10 dark:via-zinc-700/30 dark:to-black/10" />
      </div>
      <h1 className="text-balance bg-gradient-to-tr from-black via-zinc-700 to-zinc-900 bg-clip-text text-5xl font-extrabold text-transparent drop-shadow-sm sm:text-6xl md:text-7xl dark:from-white dark:via-zinc-100 dark:to-zinc-400">
        React Boilerplate
      </h1>
      <p className="text-muted-foreground text-xl font-medium md:text-2xl">
        A complete toolkit for modern React development, production-ready application architecture
      </p>
      <Button asChild size="lg" className="mt-2 flex items-center gap-2 rounded-full">
        <Link to="https://github.com/gaoxiu333/react-template" target="_blank" rel="noopener noreferrer">
          <GithubIcon className="h-5 w-5" />
          GitHub
        </Link>
      </Button>
    </section>
  );
};

export default Hero;
