#!/usr/bin/env node
/**
 * Standalone Etsy research CLI.
 *
 *   npm run research -- "<listing-or-search-url>"
 *   npm run research-search -- "educational posters"
 *   npm run research-search -- "educational posters" --debug
 *
 * Not part of AI Factory (Generator / Pipeline / ResearchProvider).
 */
import { AntiBotError, SearchEmptyError } from './anti-bot.js';
import { researchSearchQuery, researchUrl } from './research.js';

function printUsage(): void {
  console.error(`Usage:
  npm run research -- "<etsy-listing-or-search-url>" [--debug]
  npm run research-search -- "<search query>" [--debug]

Examples:
  npm run research -- "https://www.etsy.com/listing/123456789/example"
  npm run research -- "https://www.etsy.com/search?q=wall+art"
  npm run research-search -- "educational posters"
  npm run research-search -- "educational posters" --debug
`);
}

function isHelpFlag(value: string | undefined): boolean {
  return value === '--help' || value === '-h' || value === 'help';
}

function parseArgs(rest: string[]): { input: string; debug: boolean } {
  const debug = rest.includes('--debug');
  const input = rest
    .filter((part) => part !== '--debug')
    .join(' ')
    .trim();
  return { input, debug };
}

async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  if (!command || isHelpFlag(command)) {
    printUsage();
    process.exitCode = command ? 0 : 1;
    return;
  }

  if (command === 'research') {
    const { input, debug } = parseArgs(rest);
    if (!input || isHelpFlag(rest[0])) {
      printUsage();
      process.exitCode = input && isHelpFlag(rest[0]) ? 0 : 1;
      return;
    }
    const { result, outputPath } = await researchUrl(input, { debug });
    printSummary(result, outputPath);
    return;
  }

  if (command === 'research-search') {
    const { input, debug } = parseArgs(rest);
    if (!input || isHelpFlag(rest[0])) {
      printUsage();
      process.exitCode = input && isHelpFlag(rest[0]) ? 0 : 1;
      return;
    }
    const { result, outputPath } = await researchSearchQuery(input, { debug });
    printSummary(result, outputPath);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printUsage();
  process.exitCode = 1;
}

function printSummary(
  result: Awaited<ReturnType<typeof researchUrl>>['result'],
  outputPath: string | null,
): void {
  console.log(`Source: ${result.source}`);
  console.log(`Input: ${result.input}`);
  console.log(`Listings: ${result.listingCount}`);
  for (const listing of result.listings.slice(0, 5)) {
    console.log(
      `- ${listing.title ?? '(no title)'} | ${listing.price ?? '?'} ${listing.currency ?? ''}`.trim(),
    );
    console.log(`  ${listing.listingUrl}`);
  }
  if (result.listings.length > 5) {
    console.log(`… and ${result.listings.length - 5} more`);
  }
  if (outputPath) {
    console.log(`Saved: ${outputPath}`);
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  if (error instanceof AntiBotError || error instanceof SearchEmptyError) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
