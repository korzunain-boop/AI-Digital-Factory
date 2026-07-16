import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import {
  computePosterLayout,
  computePreviewGrid,
  ETSY_CLASSIC_POSTER_TEMPLATE,
  PAPER_A4,
  PAPER_US_LETTER,
  type LayoutEngine,
} from '@ai-product-factory/domain';
import { SharpLayoutEngine } from '@ai-product-factory/infrastructure';

import { generatePostersFromBundle, PLACEHOLDER_PNG } from '@ai-product-factory/api/bundle';

const TINY_PNG = PLACEHOLDER_PNG;

describe('Product Sprint 3 — PosterTemplate + layout geometry', () => {
  it('keeps layout values on the template (≈60% coverage, centered)', () => {
    assert.equal(ETSY_CLASSIC_POSTER_TEMPLATE.backgroundColor, '#FAF6F1');
    assert.equal(ETSY_CLASSIC_POSTER_TEMPLATE.illustrationCoverage, 0.6);

    const layout = computePosterLayout({
      paper: PAPER_A4,
      template: ETSY_CLASSIC_POSTER_TEMPLATE,
    });

    const shorter = Math.min(PAPER_A4.widthPx, PAPER_A4.heightPx);
    assert.equal(layout.illustrationBox.width, shorter * 0.6);
    assert.equal(layout.illustrationBox.height, shorter * 0.6);
    assert.ok(
      Math.abs(layout.illustrationBox.x + layout.illustrationBox.width / 2 - PAPER_A4.widthPx / 2) <
        1,
    );
    assert.equal(layout.backgroundColor, ETSY_CLASSIC_POSTER_TEMPLATE.backgroundColor);
    assert.ok(layout.titleFontSizePx > 0);
    assert.ok(layout.titleBox.y > layout.illustrationBox.y);
  });

  it('supports A4 and US Letter paper sizes', () => {
    const a4 = computePosterLayout({ paper: PAPER_A4, template: ETSY_CLASSIC_POSTER_TEMPLATE });
    const letter = computePosterLayout({
      paper: PAPER_US_LETTER,
      template: ETSY_CLASSIC_POSTER_TEMPLATE,
    });
    assert.equal(a4.canvas.width, PAPER_A4.widthPx);
    assert.equal(letter.canvas.width, PAPER_US_LETTER.widthPx);
    assert.notEqual(a4.canvas.height, letter.canvas.height);
  });

  it('computes a catalog preview grid', () => {
    const grid = computePreviewGrid({
      count: 24,
      cellWidth: 100,
      cellHeight: 140,
      gap: 10,
      padding: 20,
      backgroundColor: '#FAF6F1',
      columns: 4,
    });
    assert.equal(grid.cells.length, 24);
    assert.equal(grid.columns, 4);
    assert.equal(grid.rows, 6);
  });
});

describe('Product Sprint 3 — SharpLayoutEngine', () => {
  it('renders a PNG poster from illustration + title + Style Guide + template', async () => {
    const engine = new SharpLayoutEngine();
    const png = await engine.renderPoster({
      illustrationPng: TINY_PNG,
      title: 'Ocean Whale',
      styleGuide: {
        theme: 'Ocean',
        palette: ['#F5F0E8', '#2A9D8F'],
        illustrationStyle: 'clipart',
        composition: 'centered',
        lighting: 'soft',
        mood: 'calm',
        negativeConstraints: 'text',
      },
      paper: PAPER_A4,
      template: ETSY_CLASSIC_POSTER_TEMPLATE,
    });

    assert.ok(png.length > 100);
    // PNG magic
    assert.equal(png[0], 0x89);
    assert.equal(png[1], 0x50);
  });

  it('renders a preview grid PNG', async () => {
    const engine = new SharpLayoutEngine();
    const poster = await engine.renderPoster({
      illustrationPng: TINY_PNG,
      title: 'A',
      styleGuide: {
        theme: 'T',
        palette: ['#111111'],
        illustrationStyle: 's',
        composition: 'c',
        lighting: 'l',
        mood: 'm',
        negativeConstraints: 'n',
      },
      paper: PAPER_US_LETTER,
      template: ETSY_CLASSIC_POSTER_TEMPLATE,
    });
    const preview = await engine.renderPreview({ posterPngs: [poster, poster, poster] });
    assert.ok(preview.length > 100);
    assert.equal(preview[0], 0x89);
  });
});

describe('Product Sprint 3 — generatePostersFromBundle', () => {
  it('writes poster.png files and preview.png for a bundle (Fake LayoutEngine)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'posters-sprint3-'));
    try {
      await writeFile(
        join(dir, 'style-guide.json'),
        JSON.stringify({
          theme: 'Ocean',
          palette: ['#FAF6F1', '#333333'],
          illustrationStyle: 'soft',
          composition: 'centered',
          lighting: 'day',
          mood: 'calm',
          negativeConstraints: 'text',
        }),
      );
      await writeFile(
        join(dir, 'bundle.json'),
        JSON.stringify({
          theme: 'Ocean',
          count: 2,
          createdAt: new Date().toISOString(),
          styleGuideFile: 'style-guide.json',
          promptsFile: 'prompts.json',
          illustrations: [
            {
              subject: 'Ocean subject 1',
              file: 'ocean-subject-1.png',
              prompt: 'p1',
              sourceLocation: 'memory://x',
            },
            {
              subject: 'Ocean subject 2',
              file: 'ocean-subject-2.png',
              prompt: 'p2',
              sourceLocation: 'memory://y',
            },
          ],
        }),
      );
      await writeFile(join(dir, 'ocean-subject-1.png'), TINY_PNG);
      await writeFile(join(dir, 'ocean-subject-2.png'), TINY_PNG);

      let posterCalls = 0;
      const fakeLayout: LayoutEngine = {
        async renderPoster(): Promise<Buffer> {
          posterCalls += 1;
          return TINY_PNG;
        },
        async renderPreview(): Promise<Buffer> {
          return TINY_PNG;
        },
      };

      const result = await generatePostersFromBundle({
        bundleDir: dir,
        layout: fakeLayout,
        paper: PAPER_A4,
      });

      assert.equal(posterCalls, 2);
      assert.equal(result.posterFiles.length, 2);
      assert.equal(result.previewFile, 'preview.png');
      assert.ok(result.postersDir.includes('a4'));

      const preview = await readFile(join(result.postersDir, 'preview.png'));
      assert.deepEqual(preview, TINY_PNG);
      const p1 = await readFile(join(result.postersDir, 'ocean-subject-1-poster.png'));
      assert.deepEqual(p1, TINY_PNG);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
