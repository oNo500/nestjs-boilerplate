import { Label } from '@repo/ui/components/label';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

// 基础标签
export const Basic: Story = {
  args: {
    children: '用户名',
  },
};
