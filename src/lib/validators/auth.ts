// src/lib/validations/auth.ts
import { z } from 'zod'

export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone_number: z
    .string()
    .regex(/^\+?\d{9,15}$/, { message: 'Enter a valid phone number' }),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  business_name: z.string().min(3, 'Business name must be at least 3 characters').max(100),
  business_category: z.string().min(3, 'Category is required').max(80),
  street: z.string().min(3, 'Street address is required'),
  city_town: z.string().min(2, 'City / Town is required'),
  local_government: z.string().min(2, 'Local government is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  referral_code: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type SignUpFormInput = z.infer<typeof registerSchema>