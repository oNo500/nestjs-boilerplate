import { Input } from '@repo/ui/components/input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number'],
    },
    placeholder: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

// 基础输入框
export const Basic: Story = {
  args: {
    placeholder: '请输入内容',
    type: 'text',
  },
};
