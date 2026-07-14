/**
 * Domain provider ports (implementations live in packages/infrastructure).
 * Dependency-free contracts — no SDKs, HTTP, FS, or marketplace vendor types.
 */

export type { ResearchIngestInput, ResearchProvider } from './research-provider.js';

export type { TextGenerateInput, TextGenerateOutput, TextProvider } from './text-provider.js';

export type { ImageGenerateInput, ImageGenerateOutput, ImageProvider } from './image-provider.js';

export type { StoragePutInput, StorageProvider } from './storage-provider.js';

export type { MarketplacePublishInput, MarketplaceProvider } from './marketplace-provider.js';
