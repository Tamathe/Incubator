import { z } from "zod";
import { isFridayIso } from "@/lib/friday-booking";

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const shortText = (max = 200) => z.string().trim().min(1).max(max);
const optionalText = (max = 2000) => z.string().trim().max(max).optional();
const optionalFriday = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(isFridayIso, "Date must be a Friday")
  .optional();

export const subscribeSchema = z
  .object({
    email: emailField,
    source: z.string().trim().max(50).optional(),
  })
  .strict();

export const memberRegistrationSchema = z
  .object({
    email: emailField,
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
    firstBuild: optionalText(2000),
    preferredFriday: optionalFriday,
    alternateFriday: optionalFriday,
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.alternateFriday && !data.preferredFriday) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alternateFriday"],
        message: "A preferred Friday is required before an alternate",
      });
    }
    if (
      data.preferredFriday &&
      data.alternateFriday === data.preferredFriday
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alternateFriday"],
        message: "Alternate Friday must be different",
      });
    }
  });

export const loginSchema = z
  .object({
    password: z.string().min(1).max(500),
  })
  .strict();

export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type MemberRegistrationInput = z.infer<
  typeof memberRegistrationSchema
>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type PitchInput = z.infer<typeof pitchSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
