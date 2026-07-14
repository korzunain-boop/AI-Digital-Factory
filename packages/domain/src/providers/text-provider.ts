/**
 * Text generation/transform request used by strategies or assembler metadata drafts.
 */
export interface TextGenerateInput {
  readonly prompt: string;
  readonly purpose?: string;
  readonly maxTokens?: number;
}

/**
 * Text generation result (structure only).
 */
export interface TextGenerateOutput {
  readonly text: string;
}

/**
 * Text provider port for titles, descriptions, tags drafts, etc.
 * No OpenAI or other SDK types here.
 */
export interface TextProvider {
  generate(input: TextGenerateInput): Promise<TextGenerateOutput>;
}
