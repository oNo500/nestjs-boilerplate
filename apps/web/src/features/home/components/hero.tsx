import { Nextdotjs as NextjsIcon, React as ReactIcon, Tailwindcss as TailwindcssIcon, Typescript as TypescriptIcon, Github as GithubIcon } from '@workspace/icons'
import { Button } from '@workspace/ui/components/ui/button'
import Link from 'next/link'

const stackItems = [
  {
    name: 'Next.js',
    icon: <NextjsIcon className="w-10 h-10 fill-black dark:fill-white" />,
  },
  {
    name: 'React',
    icon: <ReactIcon className="w-10 h-10 fill-black dark:fill-white" />,
  },
  {
    name: 'Tailwind CSS',
    icon: <TailwindcssIcon className="w-10 h-10 fill-black dark:fill-white" />,
  },
  {
    name: 'TypeScript',
    icon: <TypescriptIcon className="w-10 h-10 fill-black dark:fill-white" />,
  },
]

const Stack = () => {
  return (
    <ul className="flex flex-row gap-6">
      {stackItems.map((item) => (
        <li key={item.name} className="flex flex-col items-center gap-2">
          {item.icon}
          <span className="text-sm text-muted-foreground">{item.name}</span>
        </li>
      ))}
    </ul>
  )
}

const Hero = () => {
  return (
    <div className="flex flex-1 flex-col justify-between items-center ">
      <main className="flex flex-1 w-full max-w-3xl flex-col justify-between py-32 px-16 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="text-4xl font-bold">Boilerplate</h1>
          <p className="text-lg text-muted-foreground">This is a boilerplate for a web application.</p>
          <Stack />
          <Button variant="outline" asChild>
            <Link href="https://github.com/oNo500/nestjs-boilerplate" target="_blank">
              <GithubIcon className="w-4 h-4 fill-black dark:fill-white" />
              GitHub
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

export { Hero }
