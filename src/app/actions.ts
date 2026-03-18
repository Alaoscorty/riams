"use server";

import { generatePersonalizedPoem } from "@/ai/flows/ai-chat-assistant-for-customer-queries";
import { z } from "zod";

const PoemSchema = z.object({
  name1: z.string(),
  name2: z.string(),
});

export async function generatePoemAction(input: z.infer<typeof PoemSchema>): Promise<{
  success: boolean;
  poem?: string;
  error?: string;
}> {
  try {
    const validatedInput = PoemSchema.parse(input);
    const result = await generatePersonalizedPoem(validatedInput);
    if (result.poem) {
      return { success: true, poem: result.poem };
    } else {
      return { success: false, error: "La génération du poème a échoué. Veuillez réessayer." };
    }
  } catch (e) {
    console.error(e);
    if (e instanceof z.ZodError) {
      return { success: false, error: "Les données d'entrée sont invalides." };
    }
    return { success: false, error: "Une erreur inattendue est survenue." };
  }
}
