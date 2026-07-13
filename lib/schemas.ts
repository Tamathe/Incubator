import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const shortText = (max = 200) => z.string().trim().min(1).max(max);
const optionalText = (max = 2000) => z.string().trim().max(max).optional();

export const subscribeSchema = z
  .object({
    email: emailField,
    source: z.string().trim().max(50).optional(),
  })
  .strict();

export const rsvpSchema = z
  .object({
    name: shortText(200),
    email: emailField,
    role: z.string().trim().max(100).optional(),
    motivations: z.array(z.string().trim().min(1).max(100)).max(10),
    note: optionalText(5000),
    joinListserv: z.boolean(),
  })
  .strict();

export const pitchSchema = z
  .object({
    submitterName: shortText(200),
    submitterEmail: emailField,
    role: z.string().trim().max(100).optional(),
    problem: shortText(2000),
    affected: shortText(1000),
    firstBuild: shortText(2000),
  })
  .strict();

export const loginSchema = z
  .object({
    password: z.string().min(1).max(500),
  })
  .strict();

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type PitchInput = z.infer<typeof pitchSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
