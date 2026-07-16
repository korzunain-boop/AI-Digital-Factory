/**
 * Product Sprint 1 — illustration subject list for one bundle.
 */

export const DEFAULT_ILLUSTRATION_COUNT = 24;

const NURSERY_ANIMALS: readonly string[] = [
  'Elephant',
  'Lion',
  'Fox',
  'Bear',
  'Giraffe',
  'Rabbit',
  'Owl',
  'Deer',
  'Panda',
  'Koala',
  'Hedgehog',
  'Squirrel',
  'Penguin',
  'Whale',
  'Dolphin',
  'Turtle',
  'Frog',
  'Cat',
  'Dog',
  'Horse',
  'Sheep',
  'Cow',
  'Duck',
  'Chick',
];

/**
 * Generate the illustration subject list for a theme.
 * Default count: 24. Deterministic for a given theme + count.
 */
export function generateIllustrationList(
  theme: string,
  count: number = DEFAULT_ILLUSTRATION_COUNT,
): string[] {
  if (count < 1) {
    throw new Error('Illustration count must be >= 1');
  }

  const base = selectBaseSubjects(theme);
  const list: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const subject = base[i % base.length]!;
    const cycle = Math.floor(i / base.length);
    list.push(cycle === 0 ? subject : `${subject} ${cycle + 1}`);
  }
  return list;
}

function selectBaseSubjects(theme: string): readonly string[] {
  const normalized = theme.trim().toLowerCase();
  if (
    normalized.includes('nursery') ||
    normalized.includes('animal') ||
    normalized.includes('safari') ||
    normalized.includes('zoo')
  ) {
    return NURSERY_ANIMALS;
  }

  // Generic: theme label + nursery-animal fillers for a full pack of 24.
  const themeLabel = titleCase(theme.trim() || 'Subject');
  return [
    themeLabel,
    ...NURSERY_ANIMALS.filter((s) => s.toLowerCase() !== themeLabel.toLowerCase()),
  ];
}

function titleCase(value: string): string {
  return value
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
