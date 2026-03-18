'use server';

/**
 * @fileOverview Generates a personalized poem based on the names of two people.
 *
 * - generatePersonalizedPoem - A function that generates the poem.
 * - GeneratePersonalizedPoemInput - The input type for the generatePersonalizedPoem function.
 * - GeneratePersonalizedPoemOutput - The return type for the generatePersonalizedPoem function.
 */
'use server';
/**
 * @fileOverview An AI conversational assistant for RIAM'S 7.16 LOUNGE.
 *
 * - aiChatAssistantForCustomerQueries - A function that handles customer queries.
 * - AIChatAssistantForCustomerQueriesInput - The input type for the function.
 * - AIChatAssistantForCustomerQueriesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIChatAssistantForCustomerQueriesInputSchema = z.object({
  message: z.string().describe("The customer's message or question to the AI assistant."),
});
export type AIChatAssistantForCustomerQueriesInput = z.infer<typeof AIChatAssistantForCustomerQueriesInputSchema>;

const AIChatAssistantForCustomerQueriesOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response to the customer's query."),
});
export type AIChatAssistantForCustomerQueriesOutput = z.infer<typeof AIChatAssistantForCustomerQueriesOutputSchema>;

export async function aiChatAssistantForCustomerQueries(
  input: AIChatAssistantForCustomerQueriesInput
): Promise<AIChatAssistantForCustomerQueriesOutput> {
  return aiChatAssistantForCustomerQueriesFlow(input);
}

const aiChatAssistantForCustomerQueriesPrompt = ai.definePrompt({
  name: 'aiChatAssistantForCustomerQueriesPrompt',
  input: { schema: AIChatAssistantForCustomerQueriesInputSchema },
  output: { schema: AIChatAssistantForCustomerQueriesOutputSchema },
  prompt: `You are an expert AI conversational assistant for RIAM'S 7.16 LOUNGE, a premium and professional bar-restaurant located in Porto-Novo, Benin.

Your role is to assist customers by providing precise, polite, and helpful information about the lounge's services, location, and ordering process.

Key Information about RIAM'S 7.16 LOUNGE:
- **Location**: Porto-Novo, quartier Dowa-Dédomin, situated exactly next to Carrefour Gandaho, Benin.
- **Atmosphere**: Modern, elegant, professional, and welcoming. Ideal for dining, cocktails, and relaxation.
- **Menu Specialties**:
    * **Grillades**: Succulent grilled meats and specialties.
    * **Poissons**: Freshly prepared grilled or braised fish.
    * **Burgers**: Gourmet burgers made with quality ingredients.
    * **Snacks**: Quick appetizers and crispy treats.
    * **Boissons & Cocktails**: A wide range of refreshing drinks and signature cocktails from our bar.
- **Ordering Process**:
    1. Select items from our online menu.
    2. Fill in delivery details (Name, Phone, Address).
    3. **Payment**: For online orders, customers MUST make a deposit via Mobile Money (+229 97 00 00 00) and upload a screenshot (capture) of the payment proof in the cart page.
    4. **Validation**: The administration verifies the proof before preparing the order.
- **Tracking**: Customers can track their order status in real-time on the "Track" page using their order ID or by logging in with their phone number to see their history.
- **Delivery**: Available to various zones in Porto-Novo (Dowa, Djassin, Ouando) with applicable fees.

Instructions for your responses:
- Maintain a professional, warm, and sophisticated tone that reflects the "Lounge" brand.
- Be concise but complete.
- If a customer asks about prices, mention that general prices are available on the online menu and can vary based on options.
- If you lack specific information (like current promotions not listed here), invite the customer to check the website or contact us directly on WhatsApp (+229 97 00 00 00).
- Answer in the same language as the customer (French, English, or Spanish).

Customer's message: {{{message}}}`,
});

const aiChatAssistantForCustomerQueriesFlow = ai.defineFlow(
  {
    name: 'aiChatAssistantForCustomerQueriesFlow',
    inputSchema: AIChatAssistantForCustomerQueriesInputSchema,
    outputSchema: AIChatAssistantForCustomerQueriesOutputSchema,
  },
  async (input) => {
    const { output } = await aiChatAssistantForCustomerQueriesPrompt(input);
    return output!;
  }
);


import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedPoemInputSchema = z.object({
  name1: z.string().describe('The first name to include in the poem.'),
  name2: z.string().describe('The second name to include in the poem.'),
});
export type GeneratePersonalizedPoemInput = z.infer<typeof GeneratePersonalizedPoemInputSchema>;

const GeneratePersonalizedPoemOutputSchema = z.object({
  poem: z.string().describe('The generated poem.'),
});
export type GeneratePersonalizedPoemOutput = z.infer<typeof GeneratePersonalizedPoemOutputSchema>;

export async function generatePersonalizedPoem(
  input: GeneratePersonalizedPoemInput
): Promise<GeneratePersonalizedPoemOutput> {
  return generatePersonalizedPoemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedPoemPrompt',
  input: {schema: GeneratePersonalizedPoemInputSchema},
  output: {schema: GeneratePersonalizedPoemOutputSchema},
  prompt: `Write a beautiful and romantic poem that includes the names {{name1}} and {{name2}}.\n\nThe poem should evoke feelings of love, connection, and admiration. Make it unique to those names.`,
});

const generatePersonalizedPoemFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedPoemFlow',
    inputSchema: GeneratePersonalizedPoemInputSchema,
    outputSchema: GeneratePersonalizedPoemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
