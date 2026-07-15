#!/usr/bin/env node
/**
 * Standalone Etsy research CLI.
 *
 *   npm run research -- "<listing-or-search-url>"
 *   npm run research-search -- "educational posters"
 *
 * Not part of AI Factory (Generator / Pipeline / ResearchProvider).
 */
import { researchSearchQuery, researchUrl } from './research.js';

function printUsage(): void {
  console.error(`Usage:
  npm run research -- "<etsy-listing-or-search-url>"
  npm run research-search -- "<search query>"

Examples:
  npm run research -- "https://www.etsy.com/listing/123456789/example"
  npm run research -- "https://www.etsy.com/search?q=wall+art"
  npm run research-search -- "educational posters"
`);
}

function isHelpFlag(value: string | undefined): boolean {
  return value === '--help' || value === '-h' || value === 'help';
}

async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  if (!command || isHelpFlag(command)) {
    printUsage();
    process.exitCode = command ? 0 : 1;
    return;
  }

  if (command === 'research') {
    const input = rest.join(' ').trim();
    if (!input || isHelpFlag(rest[0])) {
      printUsage();
      process.exitCode = input && isHelpFlag(rest[0]) ? 0 : 1;
      return;
    }
    const { result, outputPath } = await researchUrl(input);
    printSummary(result, outputPath);
    return;
  }

  if (command === 'research-search') {
    const query = rest.join(' ').trim();
    if (!query || isHelpFlag(rest[0])) {
      printUsage();
      process.exitCode = query && isHelpFlag(rest[0]) ? 0 : 1;
      return;
    }
    const { result, outputPath } = await researchSearchQuery(query);
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
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
