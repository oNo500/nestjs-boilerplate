import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@repo/ui/components/dropdown-menu';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

// 基础下拉菜单
export const Basic: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>打开菜单</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        <DropdownMenuItem>编辑</DropdownMenuItem>
        <DropdownMenuItem>删除</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>更多</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// 带 Checkbox/Radio 的下拉菜单
export const WithCheckboxRadio: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>多选菜单</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem checked>选项A</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>选项B</DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="1">
          <DropdownMenuRadioItem value="1">单选1</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="2">单选2</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
