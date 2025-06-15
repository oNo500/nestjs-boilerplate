import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

import { type RegisterRequest, useRegister } from '@/auth/use-auth';

const formSchema = z
  .object({
    email: z.string().min(1, { message: 'Email is required' }),
    password: z.string().min(1, { message: 'Password is required' }),
    confirmPassword: z.string().min(1, { message: 'Confirm Password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const RegisterForm = ({
  className,
  onSuccess,
}: {
  className?: string;
  onSuccess: (values: RegisterRequest) => void;
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const registerMutation = useRegister();
  function onSubmit(values: typeof formSchema._type) {
    const payload: RegisterRequest = {
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      code: '123456', // TODO: code from email
    };
    registerMutation.mutate(payload, {
      onSuccess: () => {
        onSuccess(payload);
      },
    });
  }
  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your password" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Confirm your password" {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              Sign Up
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
