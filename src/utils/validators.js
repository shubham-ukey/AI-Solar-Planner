import { z } from "zod";

// Schemas will be composed per planner step in Phase 2.
export const phoneSchema = z.string().regex(/^[0-9]{10}$/, "Enter a 10-digit phone number.");
export const emailSchema = z.email("Enter a valid email address.");
