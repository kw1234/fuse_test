import { z } from 'zod';

export const WebSearchInputZodSchema = z.object({
  query: z.string().describe('The search query to execute'),
    maxResults: z
      .number()
      .default(10)
      .describe('Maximum number of search results to return (1-20, default: 10)')
      .optional(),
});

export const WebSearchParametersZodSchema = z.object({
  toolDescription: z
    .string()
    .describe(
      "A clear, human-readable status message describing the topic of research being done on the internet. This will be shown to the user while the tool is being called, so phrase it as a present-tense status update (e.g., 'Researching the topic of ...'). Explain what resources you are using and endpoints you are calling and what steps you are taking in natural language.",
    ),
  input: WebSearchInputZodSchema,
});
