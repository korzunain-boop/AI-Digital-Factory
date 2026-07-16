import type { CreativeDirector } from './creative-director.js';
import {
  ETSY_TAG_COUNT,
  parseProductMetadata,
  type ProductMetadata,
  type ProductMetadataInput,
} from './product-metadata.js';
import { parseStyleGuide, type StyleGuide } from './style-guide.js';

/**
 * Fake CreativeDirector for unit tests (no LLM).
 * Deterministic, theme-parameterized — not a static catalog switch.
 */
export class FakeCreativeDirector implements CreativeDirector {
  createStyleGuideCalls = 0;
  createSubjectsCalls = 0;
  createPromptsCalls = 0;
  createProductMetadataCalls = 0;

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

  async createProductMetadata(input: ProductMetadataInput): Promise<ProductMetadata> {
    this.createProductMetadataCalls += 1;
    const theme = input.theme.trim() || input.styleGuide.theme;
    const count = input.posters.length || input.subjects?.length || 24;
    const primary = input.styleGuide.palette[0] ?? '#F5F0E8';
    const secondary = input.styleGuide.palette[1] ?? '#D4A373';
    const tags = Array.from({ length: ETSY_TAG_COUNT }, (_, i) =>
      i === 0 ? `${theme} print` : `${theme} tag ${i}`,
    );

    return parseProductMetadata({
      title: `${theme} Printable Poster Bundle — ${count} Wall Art Prints`,
      shortDescription: `Instant download ${theme} poster pack with ${count} matching printable designs.`,
      longDescription: [
        `Bring ${theme} into your space with this cohesive printable poster bundle.`,
        `Includes ${count} high-resolution poster designs styled for ${input.styleGuide.mood}.`,
        `Art direction: ${input.styleGuide.illustrationStyle}.`,
        'Digital download only — print at home or with a professional printer.',
        'Perfect for gallery walls, nurseries, offices, and gift listings.',
      ].join('\n\n'),
      tags,
      materials: ['Digital download', 'Printable PDF/PNG artwork'],
      primaryColor: primary,
      secondaryColor: secondary,
      occasion: 'Housewarming',
      room: 'Living Room',
      ageGroup: 'Adults',
      seoKeywords: [
        `${theme} printable`,
        `${theme} wall art`,
        'digital download poster',
        'gallery wall print set',
      ],
    });
  }
}
