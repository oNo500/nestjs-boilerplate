import { Navigation } from './navigation'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Navigation> = {
  title: 'Plus/Navigation',
  component: Navigation,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Navigation>

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

export const NoActiveItem: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'About', href: '/about' },
    ],
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
      { label: 'Contact', href: '/contact' },
    ],
  },
}
