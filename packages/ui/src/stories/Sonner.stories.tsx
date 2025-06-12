import { Toaster, toast } from '@repo/ui/components/sonner';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Toaster> = {
  title: 'Components/Sonner',
  component: Toaster,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

// 基础 Toaster
export const Basic: Story = {
  render: () => <Toaster />,
};

// 触发 toast
export const WithToast: Story = {
  render: () => (
    <>
      <button onClick={() => toast('Hello Sonner!')}>显示 Toast</button>
      <Toaster />
    </>
  ),
};
