import { Nextdotjs as NextjsIcon } from '@workspace/icons'
import Link from 'next/link'

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <Link href="/">
        <NextjsIcon className="w-6 h-6 fill-black dark:fill-white" />
      </Link>
    </div>
  )
}

export { Logo }
