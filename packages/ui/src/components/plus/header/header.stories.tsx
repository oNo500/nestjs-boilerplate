import { MoonIcon, SunIcon } from 'lucide-react'

import { MobileNavigation } from '@workspace/ui/components/plus/mobile-navigation'
import { Navigation } from '@workspace/ui/components/plus/navigation'
import { Button } from '@workspace/ui/components/ui/button'

import { Header, HeaderCenter, HeaderEnd, HeaderStart } from './header'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Header> = {
  title: 'Plus/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['static', 'sticky'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Header>

const navItems = [
  { label: 'Home', href: '/', active: true },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export const Simple: Story = {
  args: {
    variant: 'static',
    className: 'border-b',
  },
  render: (args) => (
    <Header {...args}>
      <div className="font-semibold">Logo</div>
      <nav className="flex gap-4 text-sm">
        <a href="#" className="text-foreground">Home</a>
        <a href="#" className="text-muted-foreground">About</a>
      </nav>
      <div className="size-8 rounded-full bg-muted" />
    </Header>
  ),
}

export const WithSubcomponents: Story = {
  args: {
    variant: 'static',
    className: 'border-b',
  },
  render: (args) => (
    <Header {...args}>
      <HeaderStart>
        <div className="font-semibold">Logo</div>
      </HeaderStart>

      <HeaderCenter>
        <Navigation items={navItems} />
      </HeaderCenter>

      <HeaderEnd>
        <Button variant="ghost" size="icon">
          <SunIcon className="size-4" />
        </Button>
        <div className="size-8 rounded-full bg-muted" />
      </HeaderEnd>
    </Header>
  ),
}

export const Responsive: Story = {
  args: {
    variant: 'sticky',
    className: 'border-b',
  },
  render: (args) => (
    <div>
      <Header {...args}>
        <HeaderStart>
          <MobileNavigation items={navItems} className="md:hidden" />
          <div className="font-semibold">Logo</div>
        </HeaderStart>

        <HeaderCenter className="hidden md:flex">
          <Navigation items={navItems} />
        </HeaderCenter>

        <HeaderEnd>
          <Button variant="ghost" size="icon">
            <MoonIcon className="size-4" />
          </Button>
          <div className="size-8 rounded-full bg-muted" />
        </HeaderEnd>
      </Header>

      <div className="h-[200vh] p-4">
        <p className="text-muted-foreground">
          Resize viewport to see responsive behavior. Scroll to see sticky header.
        </p>
      </div>
    </div>
  ),
}

export const Sticky: Story = {
  args: {
    variant: 'sticky',
    className: 'border-b',
  },
  render: (args) => (
    <div>
      <Header {...args}>
        <HeaderStart>
          <div className="font-semibold">Logo</div>
        </HeaderStart>

        <HeaderCenter>
          <Navigation items={navItems} />
        </HeaderCenter>

        <HeaderEnd>
          <Button variant="ghost" size="icon">
            <SunIcon className="size-4" />
          </Button>
        </HeaderEnd>
      </Header>

      <div className="h-[200vh] p-4">
        <p className="text-muted-foreground">Scroll down to see sticky header...</p>
      </div>
    </div>
  ),
}
