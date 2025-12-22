import {
  Header,
  HeaderCenter,
  HeaderEnd,
  HeaderStart,
} from '@workspace/ui/components/plus/header'

import { BlankLayout } from './blank-layout'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof BlankLayout> = {
  title: 'Blocks/BlankLayout',
  component: BlankLayout,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    bordered: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof BlankLayout>

export const Default: Story = {
  args: {
    bordered: false,
  },
  render: (args) => (
    <BlankLayout {...args}>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Default Layout</h1>
        <p className="mt-2 text-muted-foreground">Basic layout without borders</p>
      </div>
    </BlankLayout>
  ),
}

export const Bordered: Story = {
  args: {
    bordered: true,
  },
  render: (args) => (
    <BlankLayout {...args}>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Bordered Layout</h1>
        <p className="mt-2 text-muted-foreground">
          Grid borders visible on lg breakpoint and above
        </p>
      </div>
    </BlankLayout>
  ),
}

export const WithHeader: Story = {
  args: {
    bordered: true,
  },
  render: (args) => (
    <BlankLayout {...args}>
      <Header variant="sticky" className="border-b">
        <HeaderStart>
          <span className="font-semibold">Logo</span>
        </HeaderStart>
        <HeaderCenter>Navigation</HeaderCenter>
        <HeaderEnd>Actions</HeaderEnd>
      </Header>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Page Content</h1>
        <p className="mt-2 text-muted-foreground">
          Combined with Header component
        </p>
      </main>
    </BlankLayout>
  ),
}
