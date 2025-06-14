import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { cn } from '@repo/ui/lib/utils';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

import { useLogin, type LoginRequest } from '@/auth';

const formSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const LoginForm = ({ className, onSuccess }: { className?: string; onSuccess?: () => void }) => {
  const form = useForm<LoginRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin();

  const handleSubmit = async (data: LoginRequest) => {
    await loginMutation.mutateAsync(data);
    onSuccess?.();
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input id="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input id="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
              Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
