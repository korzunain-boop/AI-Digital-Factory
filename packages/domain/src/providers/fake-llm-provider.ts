import type { LLMCompleteInput, LLMCompleteOutput, LLMProvider } from './llm-provider.js';

/**
 * Fake LLMProvider for tests and offline CLI until a real adapter exists.
 *
 * Returns deterministic JSON shaped for bundle generation.
 * No theme switch statements and no static subject catalogs — responses are
 * derived from the request prompt/purpose only.
 */
export class FakeLLMProvider implements LLMProvider {
  invocationCount = 0;
  readonly calls: LLMCompleteInput[] = [];

  async complete(input: LLMCompleteInput): Promise<LLMCompleteOutput> {
    this.invocationCount += 1;
    this.calls.push(input);

    const purpose = input.purpose ?? 'general';
    if (purpose === 'style-guide') {
      return { text: fakeStyleGuideJson(input.prompt) };
    }
    if (purpose === 'illustration-subjects') {
      return { text: fakeSubjectsJson(input.prompt) };
    }
    if (purpose === 'illustration-prompts') {
      return { text: fakePromptsJson(input.prompt) };
    }
    return { text: `{"ok":true,"echo":${JSON.stringify(input.prompt)}}` };
  }
}

function extractTheme(prompt: string): string {
  const match = prompt.match(/theme:\s*(.+?)(?:\n|$)/i);
  return (match?.[1] ?? 'Theme').trim();
}

function extractCount(prompt: string): number {
  const match = prompt.match(/count:\s*(\d+)/i);
  if (!match?.[1]) {
    return 24;
  }
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : 24;
}

function fakeStyleGuideJson(prompt: string): string {
  const theme = extractTheme(prompt);
  return JSON.stringify({
    theme,
    palette: ['#F5F0E8', '#D4A373', '#CCD5AE', '#E9EDC9', '#FAEDCD'],
    illustrationStyle: `cohesive clipart style for ${theme}, clean shapes, soft outlines`,
    composition: 'single centered subject, simple scene, generous negative space',
    lighting: 'soft even daylight',
    mood: `friendly premium digital-download mood for ${theme}`,
    negativeConstraints:
      'text, watermark, logo, photorealistic, cluttered background, low quality, blurry',
  });
}

function fakeSubjectsJson(prompt: string): string {
  const theme = extractTheme(prompt);
  const count = extractCount(prompt);
  const subjects = Array.from({ length: count }, (_, i) => `${theme} subject ${i + 1}`);
  return JSON.stringify({ subjects });
}

function fakePromptsJson(prompt: string): string {
  // Prefer subjects listed in the prompt after "subjects:" JSON or lines.
  let subjects: string[] = [];
  const jsonMatch = prompt.match(/subjects_json:\s*(\[[\s\S]*?\])/i);
  if (jsonMatch?.[1]) {
    try {
      const parsed = JSON.parse(jsonMatch[1]) as unknown;
      if (Array.isArray(parsed)) {
        subjects = parsed.filter((s): s is string => typeof s === 'string');
      }
    } catch {
      subjects = [];
    }
  }
  if (subjects.length === 0) {
    const count = extractCount(prompt);
    const theme = extractTheme(prompt);
    subjects = Array.from({ length: count }, (_, i) => `${theme} subject ${i + 1}`);
  }

  const styleSnippet =
    prompt.match(/illustrationStyle:\s*(.+?)(?:\n|$)/i)?.[1]?.trim() ?? 'clipart';
  const prompts = subjects.map(
    (subject) =>
      `Illustration of ${subject}. Style: ${styleSnippet}. Keep visual consistency with the collection Style Guide. Subject only: ${subject}.`,
  );
  return JSON.stringify({ prompts });
}
