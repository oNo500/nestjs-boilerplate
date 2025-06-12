import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@repo/ui/components/card';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

// 基础卡片
export const Basic: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>卡片标题</CardTitle>
        <CardDescription>卡片描述信息</CardDescription>
        <CardAction>
          <button>操作</button>
        </CardAction>
      </CardHeader>
      <CardContent>这里是卡片内容区域。</CardContent>
      <CardFooter>
        <button>底部按钮</button>
      </CardFooter>
    </Card>
  ),
};
