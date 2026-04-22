import { z } from 'zod';

export const petFormSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100, 'Name is too long.'),
  species: z.enum(['Dog', 'Cat', 'Other']),
  breed: z.string().max(100, 'Breed is too long.').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes are too long.').optional().or(z.literal('')),
});

export type PetFormValues = z.infer<typeof petFormSchema>;
