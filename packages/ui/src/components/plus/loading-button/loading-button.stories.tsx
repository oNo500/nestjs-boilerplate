import { LoadingButton } from './loading-button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof LoadingButton> = {
  title: 'Plus/LoadingButton',
  component: LoadingButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    loading: {
      control: 'boolean',
    },
    loadingText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof LoadingButton>

export const Default: Story = {
  args: {
    children: 'Submit',
  },
}

export const Loading: Story = {
  args: {
    children: 'Submit',
    loading: true,
  },
}

export const LoadingWithText: Story = {
  args: {
    children: 'Submit',
    loading: true,
    loadingText: 'Submitting...',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <LoadingButton variant="default">Default</LoadingButton>
      <LoadingButton variant="destructive">Destructive</LoadingButton>
      <LoadingButton variant="outline">Outline</LoadingButton>
      <LoadingButton variant="secondary">Secondary</LoadingButton>
      <LoadingButton variant="ghost">Ghost</LoadingButton>
      <LoadingButton variant="link">Link</LoadingButton>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <LoadingButton size="sm">Small</LoadingButton>
      <LoadingButton size="default">Default</LoadingButton>
      <LoadingButton size="lg">Large</LoadingButton>
    </div>
  ),
}

export const AllLoadingStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <LoadingButton variant="default" loading>Default</LoadingButton>
      <LoadingButton variant="destructive" loading>Destructive</LoadingButton>
      <LoadingButton variant="outline" loading>Outline</LoadingButton>
      <LoadingButton variant="secondary" loading>Secondary</LoadingButton>
    </div>
  ),
}
