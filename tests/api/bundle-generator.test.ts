import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { FakeImageProvider } from '@ai-product-factory/domain';

import {
  composeIllustrationPrompt,
  composeIllustrationPrompts,
  DEFAULT_ILLUSTRATION_COUNT,
  generateIllustrationBundle,
  generateIllustrationList,
  generateStyleGuide,
  PLACEHOLDER_PNG,
  resolveImageBytes,
} from '@ai-product-factory/api/bundle';

describe('Product Sprint 1 — Style Guide', () => {
  it('generates a complete Style Guide once for a theme (deterministic)', () => {
    const a = generateStyleGuide('Nursery Animals');
    const b = generateStyleGuide('Nursery Animals');

    assert.equal(a.theme, 'Nursery Animals');
    assert.ok(a.palette.length >= 3);
    assert.ok(a.illustrationStyle.length > 0);
    assert.ok(a.composition.length > 0);
    assert.ok(a.lighting.length > 0);
    assert.ok(a.mood.length > 0);
    assert.ok(a.negativeConstraints.includes('watermark'));
    assert.deepEqual(a, b);
  });
});

describe('Product Sprint 1 — illustration list', () => {
  it('defaults to 24 nursery animals for Nursery Animals theme', () => {
    const list = generateIllustrationList('Nursery Animals');
    assert.equal(list.length, DEFAULT_ILLUSTRATION_COUNT);
    assert.equal(list[0], 'Elephant');
    assert.equal(list[1], 'Lion');
    assert.equal(list[2], 'Fox');
    assert.equal(list[3], 'Bear');
    assert.equal(list[4], 'Giraffe');
    assert.ok(list.includes('Chick'));
  });
});

describe('Product Sprint 1 — prompt composer', () => {
  it('reuses Style Guide and only changes the subject', () => {
    const guide = generateStyleGuide('Nursery Animals');
    const elephant = composeIllustrationPrompt(guide, 'Elephant');
    const lion = composeIllustrationPrompt(guide, 'Lion');

    assert.match(elephant, /Elephant/);
    assert.match(lion, /Lion/);
    assert.match(elephant, /Color palette:/);
    assert.ok(elephant.includes(guide.illustrationStyle));
    assert.ok(lion.includes(guide.illustrationStyle));
    assert.match(elephant, /Keep visual consistency/);
    assert.notEqual(elephant, lion);

    const prompts = composeIllustrationPrompts(guide, ['Elephant', 'Lion']);
    assert.equal(prompts.length, 2);
    assert.equal(prompts[0], elephant);
  });
});

describe('Product Sprint 1 — generateIllustrationBundle (mocked ImageProvider)', () => {
  it('calls ImageProvider once and writes PNGs + JSON artifacts', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'bundle-sprint1-'));
    const provider = new FakeImageProvider();

    try {
      const result = await generateIllustrationBundle(provider, {
        theme: 'Nursery Animals',
        outputDir,
        count: 3,
        requestId: 'bundle-test-1',
      });

      assert.equal(provider.invocationCount, 1);
      assert.equal(provider.lastPrompt?.count, 3);
      assert.equal(provider.lastPrompt?.purpose, 'illustration-bundle');
      assert.equal(provider.lastPrompt?.prompts.length, 3);
      assert.equal(provider.lastPrompt?.negativePrompt, result.styleGuide.negativeConstraints);
      assert.match(provider.lastPrompt?.prompts[0] ?? '', /Elephant/);
      assert.match(provider.lastPrompt?.prompts[1] ?? '', /Lion/);
      assert.match(provider.lastPrompt?.prompts[2] ?? '', /Fox/);

      assert.equal(result.subjects.length, 3);
      assert.equal(result.manifest.count, 3);

      const styleGuide = JSON.parse(
        await readFile(join(outputDir, 'style-guide.json'), 'utf8'),
      ) as { theme: string };
      assert.equal(styleGuide.theme, 'Nursery Animals');

      const promptsFile = JSON.parse(await readFile(join(outputDir, 'prompts.json'), 'utf8')) as {
        prompts: { subject: string }[];
      };
      assert.equal(promptsFile.prompts.length, 3);

      const bundle = JSON.parse(await readFile(join(outputDir, 'bundle.json'), 'utf8')) as {
        illustrations: { file: string; subject: string }[];
      };
      assert.deepEqual(
        bundle.illustrations.map((i) => i.file),
        ['elephant.png', 'lion.png', 'fox.png'],
      );

      const elephantPng = await readFile(join(outputDir, 'elephant.png'));
      assert.deepEqual(elephantPng, PLACEHOLDER_PNG);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});

describe('resolveImageBytes', () => {
  it('decodes data URLs and placeholders for memory://', async () => {
    const memory = await resolveImageBytes('memory://clipart/x.png');
    assert.deepEqual(memory, PLACEHOLDER_PNG);

    const data = await resolveImageBytes(
      `data:image/png;base64,${PLACEHOLDER_PNG.toString('base64')}`,
    );
    assert.deepEqual(data, PLACEHOLDER_PNG);
  });
});
