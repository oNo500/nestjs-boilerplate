import { BlankLayout } from '@/components/layouts'
import { Link } from '@/components/link'
import { appPaths } from '@/config/app-paths'

const NotFoundPage = () => {
  return (
    <BlankLayout>
      <div className="mt-52 flex flex-col items-center font-semibold">
        <h1>404 - Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link href={appPaths.home.getHref()} replace>
          Go to Home
        </Link>
      </div>
    </BlankLayout>
  )
}

export default NotFoundPage
