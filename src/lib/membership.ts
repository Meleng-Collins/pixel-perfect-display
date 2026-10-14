import { z } from 'zod';
export const documentLimit = 5 * 1024 * 1024;
export const documentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;
export const membershipSchema = z.object({ phone: z.string().trim().min(5).max(40), address: z.string().trim().min(1).max(500), membership_number: z.string().trim().max(80) });
export const documentSchema = z.object({ object_path: z.string().max(200), file_name: z.string().trim().min(1).max(180), category: z.enum(['identity', 'address', 'other']), mime_type: z.enum(documentTypes), size_bytes: z.number().int().min(1).max(documentLimit) });
export function validDocument(file: { size: number; type: string }) { return file.size > 0 && file.size <= documentLimit && documentTypes.some(t => t === file.type); }