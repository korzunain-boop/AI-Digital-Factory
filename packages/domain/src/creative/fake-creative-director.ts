import type { CreativeDirector } from './creative-director.js';
import { parseStyleGuide, type StyleGuide } from './style-guide.js';

/**
 * Fake CreativeDirector for unit tests (no LLM).
 * Deterministic, theme-parameterized — not a static catalog switch.
 */
export class FakeCreativeDirector implements CreativeDirector {
  createStyleGuideCalls = 0;
  createSubjectsCalls = 0;
  createPromptsCalls = 0;

  async createStyleGuide(theme: string): Promise<StyleGuide> {
    this.createStyleGuideCalls += 1;
    const cleaned = theme.trim() || 'Theme';
    return parseStyleGuide(
      {
        theme: cleaned,
        palette: ['#F5F0E8', '#D4A373', '#CCD5AE', '#E9EDC9', '#FAEDCD'],
        illustrationStyle: `cohesive clipart style for ${cleaned}, clean shapes, soft outlines`,
        composition: 'single centered subject, simple scene, generous negative space',
        lighting: 'soft even daylight',
        mood: `friendly premium digital-download mood for ${cleaned}`,
        negativeConstraints:
          'text, watermark, logo, photorealistic, cluttered background, low quality, blurry',
      },
      cleaned,
    );
  }

  async createSubjects(input: {
    readonly theme: string;
    readonly styleGuide: StyleGuide;
    readonly count: number;
  }): Promise<string[]> {
    this.createSubjectsCalls += 1;
    const theme = input.theme.trim() || input.styleGuide.theme;
    return Array.from({ length: input.count }, (_, i) => `${theme} subject ${i + 1}`);
  }

  async createPrompts(input: {
    readonly styleGuide: StyleGuide;
    readonly subjects: readonly string[];
  }): Promise<string[]> {
    this.createPromptsCalls += 1;
    const { styleGuide, subjects } = input;
    return subjects.map(
      (subject) =>
        `Illustration of ${subject}. Style: ${styleGuide.illustrationStyle}. Composition: ${styleGuide.composition}. Lighting: ${styleGuide.lighting}. Mood: ${styleGuide.mood}. Palette: ${styleGuide.palette.join(', ')}. Keep visual consistency. Subject only: ${subject}.`,
    );
  }
}
