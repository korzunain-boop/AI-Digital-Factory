import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  ETSY_TAG_COUNT,
  FakeCreativeDirector,
  FakeLLMProvider,
  parseProductMetadata,
  parseStyleGuide,
} from '@ai-product-factory/domain';
import { LLMCreativeDirector } from '@ai-product-factory/infrastructure';

import { ProductMetadataGenerator } from '@ai-product-factory/api/bundle';

describe('Product Sprint 4 — FakeCreativeDirector.createProductMetadata', () => {
  it('returns exactly 13 tags and portable commercial fields', async () => {
    const director = new FakeCreativeDirector();
    const styleGuide = await director.createStyleGuide('Ocean');
    const metadata = await director.createProductMetadata({
      theme: 'Ocean',
      styleGuide,
      posters: [
        { title: 'Wave Crest', file: 'wave-crest-poster.png' },
        { title: 'Shell Study', file: 'shell-study-poster.png' },
      ],
      subjects: ['Wave Crest', 'Shell Study'],
    });

    assert.equal(director.createProductMetadataCalls, 1);
    assert.equal(metadata.tags.length, ETSY_TAG_COUNT);
    assert.ok(metadata.title.includes('Ocean'));
    assert.ok(metadata.shortDescription.length > 0);
    assert.ok(metadata.longDescription.length > 0);
    assert.ok(metadata.materials.length >= 1);
    assert.equal(metadata.primaryColor, styleGuide.palette[0]);
    assert.equal(metadata.secondaryColor, styleGuide.palette[1]);
    assert.ok(metadata.occasion);
    assert.ok(metadata.room);
    assert.ok(metadata.ageGroup);
    assert.ok(metadata.seoKeywords.length >= 1);
  });
});

describe('Product Sprint 4 — LLMCreativeDirector.createProductMetadata', () => {
  it('uses LLM purpose product-metadata behind CreativeDirector', async () => {
    const llm = new FakeLLMProvider();
    const director = new LLMCreativeDirector(llm);
    const styleGuide = await director.createStyleGuide('Nursery Animals');
    const metadata = await director.createProductMetadata({
      theme: 'Nursery Animals',
      styleGuide,
      posters: [{ title: 'Sleepy Fox', file: 'sleepy-fox-poster.png' }],
    });

    assert.equal(llm.invocationCount, 2);
    assert.equal(llm.calls[1]?.purpose, 'product-metadata');
    assert.equal(metadata.tags.length, ETSY_TAG_COUNT);
    assert.ok(metadata.title.includes('Nursery Animals'));
  });
});

describe('Product Sprint 4 — ProductMetadataGenerator', () => {
  it('writes metadata.json using mocked CreativeDirector only', async () => {
    const bundleDir = await mkdtemp(join(tmpdir(), 'metadata-sprint4-'));
    const director = new FakeCreativeDirector();

    try {
      const styleGuide = await director.createStyleGuide('Dinosaurs');
      await writeFile(
        join(bundleDir, 'style-guide.json'),
        `${JSON.stringify(styleGuide, null, 2)}\n`,
        'utf8',
      );
      await writeFile(
        join(bundleDir, 'bundle.json'),
        `${JSON.stringify(
          {
            theme: 'Dinosaurs',
            count: 2,
            createdAt: new Date().toISOString(),
            styleGuideFile: 'style-guide.json',
            promptsFile: 'prompts.json',
            illustrations: [
              {
                subject: 'Tiny T-Rex',
                file: 'tiny-t-rex.png',
                prompt: 'p1',
                sourceLocation: 'memory://a',
              },
              {
                subject: 'Gentle Brontosaurus',
                file: 'gentle-brontosaurus.png',
                prompt: 'p2',
                sourceLocation: 'memory://b',
              },
            ],
          },
          null,
          2,
        )}\n`,
        'utf8',
      );

      // Optional poster list under posters/a4
      const postersDir = join(bundleDir, 'posters', 'a4');
      await mkdir(postersDir, { recursive: true });
      await writeFile(join(postersDir, 'tiny-t-rex-poster.png'), Buffer.from([1]));
      await writeFile(join(postersDir, 'gentle-brontosaurus-poster.png'), Buffer.from([2]));
      await writeFile(join(postersDir, 'preview.png'), Buffer.from([3]));

      const beforeCalls = director.createProductMetadataCalls;
      const generator = new ProductMetadataGenerator(director);
      const result = await generator.generateFromBundleDir(bundleDir, { paperId: 'A4' });

      assert.equal(director.createProductMetadataCalls, beforeCalls + 1);
      assert.equal(result.posters.length, 2);
      assert.deepEqual(
        [...result.posters].sort((a, b) => a.file.localeCompare(b.file)),
        [
          { title: 'Gentle Brontosaurus', file: 'gentle-brontosaurus-poster.png' },
          { title: 'Tiny T-Rex', file: 'tiny-t-rex-poster.png' },
        ],
      );

      const raw = JSON.parse(await readFile(join(bundleDir, 'metadata.json'), 'utf8')) as unknown;
      const parsed = parseProductMetadata(raw);
      assert.equal(parsed.tags.length, ETSY_TAG_COUNT);
      assert.equal(parsed.title, result.metadata.title);
      assert.ok(parsed.longDescription.length > 0);
    } finally {
      await rm(bundleDir, { recursive: true, force: true });
    }
  });

  it('falls back to bundle illustrations when posters/ is missing', async () => {
    const bundleDir = await mkdtemp(join(tmpdir(), 'metadata-fallback-'));
    const director = new FakeCreativeDirector();

    try {
      const styleGuide = parseStyleGuide(
        {
          theme: 'Botanical',
          palette: ['#112233', '#445566'],
          illustrationStyle: 'line art',
          composition: 'centered',
          lighting: 'soft',
          mood: 'calm',
          negativeConstraints: 'text',
        },
        'Botanical',
      );
      await writeFile(
        join(bundleDir, 'style-guide.json'),
        `${JSON.stringify(styleGuide, null, 2)}\n`,
        'utf8',
      );
      await writeFile(
        join(bundleDir, 'bundle.json'),
        `${JSON.stringify(
          {
            theme: 'Botanical',
            count: 1,
            createdAt: new Date().toISOString(),
            styleGuideFile: 'style-guide.json',
            promptsFile: 'prompts.json',
            illustrations: [
              {
                subject: 'Fern Frond',
                file: 'fern-frond.png',
                prompt: 'p',
                sourceLocation: 'memory://x',
              },
            ],
          },
          null,
          2,
        )}\n`,
        'utf8',
      );

      const generator = new ProductMetadataGenerator(director);
      const result = await generator.generateFromBundleDir(bundleDir);

      assert.equal(result.posters.length, 1);
      assert.deepEqual(result.posters[0], { title: 'Fern Frond', file: 'fern-frond.png' });
      assert.ok(result.metadataFile.endsWith('metadata.json'));
    } finally {
      await rm(bundleDir, { recursive: true, force: true });
    }
  });
});

describe('Product Sprint 4 — parseProductMetadata', () => {
  it('rejects wrong tag counts', () => {
    assert.throws(
      () =>
        parseProductMetadata({
          title: 't',
          shortDescription: 's',
          longDescription: 'l',
          tags: ['a', 'b'],
          materials: ['Digital download'],
          primaryColor: '#fff',
          secondaryColor: '#000',
          occasion: 'Gift',
          room: 'Nursery',
          ageGroup: 'Kids',
          seoKeywords: ['k'],
        }),
      /13/,
    );
  });
});
