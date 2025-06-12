import { useForm } from 'react-hook-form';

import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Components/Form',
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj;

// 基础表单
export const Basic: Story = {
  render: () => {
    const form = useForm({ defaultValues: { username: '' } });
    return (
      <Form {...form}>
        <form>
          <FormField
            name="username"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名</FormLabel>
                <FormControl>
                  <Input placeholder="请输入用户名" {...field} />
                </FormControl>
                <FormDescription>请输入您的用户名</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};
