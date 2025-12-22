import { MenuIcon } from 'lucide-react'

import { Button } from '@workspace/ui/components/ui/button'

import { MobileNavigation } from './mobile-navigation'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof MobileNavigation> = {
  title: 'Plus/MobileNavigation',
  component: MobileNavigation,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof MobileNavigation>

const defaultItems = [
  { label: 'Home', href: '/', active: true },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export const Default: Story = {
  args: {
    items: defaultItems,
  },
}

export const CustomTrigger: Story = {
  args: {
    items: defaultItems,
    trigger: (
      <Button variant="outline" size="sm">
        <MenuIcon className="mr-2 size-4" />
        Menu
      </Button>
    ),
  },
}

export const CustomTitle: Story = {
  args: {
    items: defaultItems,
    title: 'Main Menu',
  },
}

export const ManyItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', active: true },
      { label: 'Products', href: '/products' },
      { label: 'Services', href: '/services' },
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
}
