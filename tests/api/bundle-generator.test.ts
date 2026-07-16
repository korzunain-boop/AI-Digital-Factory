import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { FakeImageProvider, FakeLLMProvider } from '@ai-product-factory/domain';

import {
  DEFAULT_ILLUSTRATION_COUNT,
  generateIllustrationBundle,
  generatePromptsWithLLM,
  generateStyleGuideWithLLM,
  generateSubjectsWithLLM,
  PLACEHOLDER_PNG,
  resolveImageBytes,
} from '@ai-product-factory/api/bundle';

describe('Product Sprint 1 — LLM Style Guide', () => {
  it('generates Style Guide via LLMProvider (no hardcoded guide)', async () => {
    const llm = new FakeLLMProvider();
    const guide = await generateStyleGuideWithLLM(llm, 'Ocean');

    assert.equal(llm.invocationCount, 1);
    assert.equal(llm.calls[0]?.purpose, 'style-guide');
    assert.equal(guide.theme, 'Ocean');
    assert.ok(guide.palette.length >= 1);
    assert.ok(guide.illustrationStyle.length > 0);
    assert.ok(guide.composition.length > 0);
    assert.ok(guide.lighting.length > 0);
    assert.ok(guide.mood.length > 0);
    assert.ok(guide.negativeConstraints.length > 0);
  });
});

describe('Product Sprint 1 — LLM subjects', () => {
  it('generates subjects via LLMProvider (no static theme arrays)', async () => {
    const llm = new FakeLLMProvider();
    const guide = await generateStyleGuideWithLLM(llm, 'Dinosaurs');
    const subjects = await generateSubjectsWithLLM(llm, 'Dinosaurs', guide, 4);

    assert.equal(subjects.length, 4);
    assert.equal(llm.calls.filter((c) => c.purpose === 'illustration-subjects').length, 1);
    assert.ok(subjects.every((s) => s.toLowerCase().includes('dinosaur')));
    assert.equal(DEFAULT_ILLUSTRATION_COUNT, 24);
  });
});

describe('Product Sprint 1 — LLM prompts', () => {
  it('generates prompts via LLMProvider following the Style Guide', async () => {
    const llm = new FakeLLMProvider();
    const guide = await generateStyleGuideWithLLM(llm, 'Nursery Animals');
    const subjects = await generateSubjectsWithLLM(llm, 'Nursery Animals', guide, 2);
    const prompts = await generatePromptsWithLLM(llm, guide, subjects);

    assert.equal(prompts.length, 2);
    assert.equal(llm.calls.filter((c) => c.purpose === 'illustration-prompts').length, 1);
    assert.ok(prompts[0]?.includes(subjects[0]!));
    assert.ok(prompts[1]?.includes(subjects[1]!));
    assert.notEqual(prompts[0], prompts[1]);
  });
});

describe('Product Sprint 1 — generateIllustrationBundle (mocked LLM + ImageProvider)', () => {
  it('runs LLM content then ImageProvider once and writes artifacts', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'bundle-sprint1-'));
    const images = new FakeImageProvider();
    const llm = new FakeLLMProvider();

    try {
      const result = await generateIllustrationBundle(images, llm, {
        theme: 'Ocean',
        outputDir,
        count: 3,
        requestId: 'bundle-test-1',
      });

      assert.equal(llm.invocationCount, 3);
      assert.deepEqual(
        llm.calls.map((c) => c.purpose),
        ['style-guide', 'illustration-subjects', 'illustration-prompts'],
      );

      assert.equal(images.invocationCount, 1);
      assert.equal(images.lastPrompt?.count, 3);
      assert.equal(images.lastPrompt?.purpose, 'illustration-bundle');
      assert.equal(images.lastPrompt?.prompts.length, 3);
      assert.equal(images.lastPrompt?.negativePrompt, result.styleGuide.negativeConstraints);

      assert.equal(result.subjects.length, 3);
      assert.equal(result.manifest.count, 3);

      const styleGuide = JSON.parse(
        await readFile(join(outputDir, 'style-guide.json'), 'utf8'),
      ) as { theme: string };
      assert.equal(styleGuide.theme, 'Ocean');

      const promptsFile = JSON.parse(await readFile(join(outputDir, 'prompts.json'), 'utf8')) as {
        prompts: { subject: string }[];
      };
      assert.equal(promptsFile.prompts.length, 3);

      const first = result.manifest.illustrations[0]!;
      const png = await readFile(join(outputDir, first.file));
      assert.deepEqual(png, PLACEHOLDER_PNG);
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
