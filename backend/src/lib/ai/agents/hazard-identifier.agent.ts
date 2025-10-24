/**
 * HazardIdentifierAgent (Phase 3a: T116)
 *
 * LangChain chain that predicts relevant hazard codes based on job description.
 * Uses Claude 3.5 Sonnet with few-shot prompting for Serbian BZR context.
 */

import { chatModel } from '../config.js';
import { HAZARD_IDENTIFIER_PROMPT, FEW_SHOT_EXAMPLES } from '../prompts/hazard-identifier.prompt.js';
import { formatHazardCodesForPrompt } from '../knowledge/hazard-codes.js';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

// =============================================================================
// Input/Output Types
// =============================================================================

export interface HazardIdentifierInput {
  positionName: string;
  jobDescription: string;
  equipment: string[]; // Array of equipment used
  workspace: string; // e.g., "office", "warehouse", "outdoor"
  workHours: {
    daily: number; // Hours per day
    shifts?: boolean; // Shift work?
    nightWork?: boolean; // Night shifts?
    overtime?: boolean; // Frequent overtime?
  };
}

export interface HazardSuggestion {
  hazardCode: string;
  confidence: number; // 0-1
  rationale: string; // Serbian explanation
}

// =============================================================================
// Zod Schema for Output Validation
// =============================================================================

const hazardSuggestionSchema = z.object({
  hazardCode: z.string().regex(/^\d{2}$/, 'Hazard code must be 2 digits'),
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(20, 'Rationale too short - explain why this hazard applies'),
});

const hazardIdentifierOutputSchema = z.array(hazardSuggestionSchema).min(3).max(10);

// =============================================================================
// LangChain Chain
// =============================================================================

/**
 * Create HazardIdentifier chain
 */
export function createHazardIdentifierChain() {
  // Output parser (validates JSON structure)
  const parser = StructuredOutputParser.fromZodSchema(hazardIdentifierOutputSchema);

  // Create chain: Prompt → LLM → Parser
  const chain = HAZARD_IDENTIFIER_PROMPT.pipe(chatModel).pipe(parser);

  return chain;
}

// =============================================================================
// Main Function
// =============================================================================

/**
 * Suggest hazards for a work position using AI
 *
 * @param input - Job position data
 * @returns Array of hazard suggestions with confidence scores
 * @throws Error if AI fails or returns invalid output
 *
 * Example:
 *   const suggestions = await suggestHazards({
 *     positionName: "Programmer",
 *     jobDescription: "Writes code 8 hours/day",
 *     equipment: ["Computer", "2 monitors"],
 *     workspace: "office",
 *     workHours: { daily: 8, overtime: true }
 *   });
 *
 *   // Returns:
 *   // [
 *   //   { hazardCode: "29", confidence: 0.95, rationale: "..." },
 *   //   { hazardCode: "33", confidence: 0.90, rationale: "..." },
 *   //   ...
 *   // ]
 */
export async function suggestHazards(input: HazardIdentifierInput): Promise<HazardSuggestion[]> {
  const chain = createHazardIdentifierChain();
  const parser = StructuredOutputParser.fromZodSchema(hazardIdentifierOutputSchema);

  // Format work hours for prompt
  const workHoursText = `${input.workHours.daily} сати дневно${
    input.workHours.shifts ? ', сменски рад' : ''
  }${input.workHours.nightWork ? ', ноћни рад' : ''}${input.workHours.overtime ? ', прековремени' : ''}`;

  // Invoke chain
  try {
    const result = await chain.invoke({
      positionName: input.positionName,
      jobDescription: input.jobDescription,
      equipment: input.equipment.join(', '),
      workspace: input.workspace,
      workHours: workHoursText,
      hazardCodesList: formatHazardCodesForPrompt(),
      fewShotExamples: FEW_SHOT_EXAMPLES,
      formatInstructions: parser.getFormatInstructions(),
    });

    return result as HazardSuggestion[];
  } catch (error) {
    console.error('HazardIdentifierAgent failed:', error);

    // Re-throw with more context
    throw new Error(
      `AI hazard suggestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
