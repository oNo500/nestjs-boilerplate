import * as z from 'zod'

// Regex patterns
const nameRegex = /^[A-Za-z0-9_-]+$/
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/

// Base field schemas
export const emailSchema = z.email()

export const passwordSchema = z.string().min(8)

export const nameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(nameRegex, 'Username can only contain letters, numbers, underscores and hyphens')

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register form schema
export const registerSchema = z
  .object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema.regex(passwordRegex, 'Password must contain letters and numbers'),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export type RegisterFormData = z.infer<typeof registerSchema>
