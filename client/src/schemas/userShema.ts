import * as z from 'zod'

// schema for validation user

export const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 character"),
  email: z.string().email("Invalid email address"),
  is_active: z.boolean(),
  branch_id: z.number(),
  role: z.string()
})

export type EditUserFormData = z.infer<typeof editUserSchema>;