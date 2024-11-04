import { z } from 'zod';

export const databaseFormSchema = z.object({
  host: z.string().min(1, 'Host is required').max(255),
  port: z.coerce
    .number()
    .int()
    .min(1, 'Port must be a positive number')
    .max(65535, 'Port must be less than 65536'),
  username: z.string().min(1, 'Username is required').max(255),
  password: z.string().min(1, 'Password is required'),
  database: z.string()
    .min(1, 'Database name is required')
    .max(64)
    .regex(/^[a-zA-Z0-9_]+$/, 'Database name can only contain letters, numbers, and underscores'),
});

export const transformationConfigSchema = z.object({
  batchSize: z.number().int().min(1).max(10000).default(1000),
  validateData: z.boolean().default(true),
  preserveIds: z.boolean().default(true),
});

export type DatabaseFormData = z.infer<typeof databaseFormSchema>;
export type TransformationConfigData = z.infer<typeof transformationConfigSchema>;