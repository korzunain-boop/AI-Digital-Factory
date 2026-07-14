/**
 * Domain provider ports (FakeImageProvider for M7–M8; other impls in infrastructure later).
 */

export type { ResearchIngestInput, ResearchProvider } from './research-provider.js';

export type { TextGenerateInput, TextGenerateOutput, TextProvider } from './text-provider.js';

export type { GeneratedImage, GeneratedImages, ImageProvider } from './image-provider.js';

export { FakeImageProvider } from './fake-image-provider.js';

export type { StoragePutInput, StorageProvider } from './storage-provider.js';

export type { MarketplacePublishInput, MarketplaceProvider } from './marketplace-provider.js';
