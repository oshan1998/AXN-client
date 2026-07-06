import { z } from "zod";

export const networkFormSchema = z.object({
  name: z.string().trim().min(1, "Give the network a name").max(80, "Keep it under 80 characters"),
  description: z.string().trim().max(300, "Keep it under 300 characters").optional(),
});

export type NetworkFormValues = z.infer<typeof networkFormSchema>;
