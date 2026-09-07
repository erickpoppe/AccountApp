import { z } from 'zod';

export const LlmSuggestionSchema = z.object({
  creditAccountId: z.number().int().positive(),
  confidence: z.enum(['low', 'medium', 'high']),
  reasoning: z.string().max(200).optional().default(''),
  payee: z.string().max(120).nullable().optional(),
  memo: z.string().max(200).nullable().optional(),
});

export type LlmSuggestion = z.infer<typeof LlmSuggestionSchema>;

/**
 * Parses LLM raw text output, strips markdown fences, and validates against schema.
 * Returns null if parsing or validation fails, or if creditAccountId is not in the allowed set.
 */
export function parseSafe(
  raw: string,
  candidateIds: Set<number>,
): LlmSuggestion | null {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    // Strip markdown code fences and retry
    try {
      const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      json = JSON.parse(stripped);
    } catch {
      return null;
    }
  }

  const parsed = LlmSuggestionSchema.safeParse(json);
  if (!parsed.success) return null;
  if (!candidateIds.has(parsed.data.creditAccountId)) return null;

  return parsed.data;
}
