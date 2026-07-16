import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  DEFAULT_ILLUSTRATION_COUNT,
  FakeCreativeDirector,
  FakeImageProvider,
  FakeLLMProvider,
} from '@ai-product-factory/domain';
import { LLMCreativeDirector } from '@ai-product-factory/infrastructure';

import {
  generateIllustrationBundle,
  PLACEHOLDER_PNG,
  resolveImageBytes,
} from '@ai-product-factory/api/bundle';

describe('Product Sprint 2 — FakeCreativeDirector', () => {
  it('creates Style Guide, subjects, and prompts consistently', async () => {
    const director = new FakeCreativeDirector();
    const styleGuide = await director.createStyleGuide('Ocean');
    const subjects = await director.createSubjects({
      theme: 'Ocean',
      styleGuide,
      count: 3,
    });
    const prompts = await director.createPrompts({ styleGuide, subjects });

    assert.equal(director.createStyleGuideCalls, 1);
    assert.equal(director.createSubjectsCalls, 1);
    assert.equal(director.createPromptsCalls, 1);
    assert.equal(styleGuide.theme, 'Ocean');
    assert.equal(subjects.length, 3);
    assert.equal(prompts.length, 3);
    assert.ok(prompts[0]?.includes(styleGuide.illustrationStyle));
    assert.ok(prompts[0]?.includes(subjects[0]!));
    assert.equal(DEFAULT_ILLUSTRATION_COUNT, 24);
  });
});

describe('Product Sprint 2 — generateIllustrationBundle (FakeCreativeDirector)', () => {
  it('depends on CreativeDirector — not LLMProvider — then ImageProvider once', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'bundle-sprint2-'));
    const images = new FakeImageProvider();
    const director = new FakeCreativeDirector();

    try {
      const result = await generateIllustrationBundle(images, director, {
        theme: 'Dinosaurs',
        outputDir,
        count: 3,
        requestId: 'bundle-test-2',
      });

      assert.equal(director.createStyleGuideCalls, 1);
      assert.equal(director.createSubjectsCalls, 1);
      assert.equal(director.createPromptsCalls, 1);
      assert.equal(images.invocationCount, 1);
      assert.equal(images.lastPrompt?.count, 3);
      assert.equal(images.lastPrompt?.purpose, 'illustration-bundle');
      assert.equal(images.lastPrompt?.negativePrompt, result.styleGuide.negativeConstraints);

      const styleGuide = JSON.parse(
        await readFile(join(outputDir, 'style-guide.json'), 'utf8'),
      ) as { theme: string };
      assert.equal(styleGuide.theme, 'Dinosaurs');

      const first = result.manifest.illustrations[0]!;
      const png = await readFile(join(outputDir, first.file));
      assert.deepEqual(png, PLACEHOLDER_PNG);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});

describe('Product Sprint 2 — LLMCreativeDirector (FakeLLMProvider)', () => {
  it('implements CreativeDirector via LLMProvider without exposing LLM to BundleGenerator', async () => {
    const llm = new FakeLLMProvider();
    const director = new LLMCreativeDirector(llm);
    const styleGuide = await director.createStyleGuide('Nursery Animals');
    const subjects = await director.createSubjects({
      theme: 'Nursery Animals',
      styleGuide,
      count: 2,
    });
    const prompts = await director.createPrompts({ styleGuide, subjects });

    assert.equal(llm.invocationCount, 3);
    assert.deepEqual(
      llm.calls.map((c) => c.purpose),
      ['style-guide', 'illustration-subjects', 'illustration-prompts'],
    );
    assert.equal(styleGuide.theme, 'Nursery Animals');
    assert.equal(subjects.length, 2);
    assert.equal(prompts.length, 2);
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
