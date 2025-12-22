import { BlankLayout, Header } from '@/components/layouts'
import { Logo } from '@/components/logo'
import type { ReactNode } from 'react'

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <BlankLayout bordered>
      <Header className=" absolute top-0">
        <Logo />
      </Header>
      {children}
    </BlankLayout>
  )
}
export default AuthLayout
