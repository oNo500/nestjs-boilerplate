import { BlankLayout } from '@/components/layouts'
import { Nav } from '@/components/nav'
import { Hero } from '@/features/home/components/hero'

export default function HomePage() {
  return (
    <BlankLayout bordered>
      <Nav />
      <Hero />
    </BlankLayout>
  )
}
