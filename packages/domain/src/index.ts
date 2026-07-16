/**
 * @ai-product-factory/domain
 *
 * Domain contracts through Milestone M8 (PromptBuilder + ImageProvider + Clipart).
 * No marketplace, filesystem, or AI SDK usage in FakeImageProvider / DefaultPromptBuilder.
 */

export type * from './objects/index.js';
export type { DomainErrorCode } from './errors/index.js';
export {
  DomainError,
  DomainErrorCodes,
  formatDomainError,
  generationFailureFromDomainError,
} from './errors/index.js';
export type { GeneratorEngine } from './engine/index.js';
export { DefaultGeneratorEngine } from './engine/index.js';
export type {
  GeneratorStrategy,
  GeneratorStrategyRegistry,
  ClipartGeneratorTemplate,
} from './strategies/index.js';
export {
  InMemoryGeneratorStrategyRegistry,
  FakeGeneratorStrategy,
  CLIPART_STRATEGY_KEY,
  parseClipartTemplate,
  toClipartTemplateParams,
  ClipartGeneratorStrategy,
  assembleClipartAssetBundle,
} from './strategies/index.js';
export type { AssembleInput, Assembler } from './assembler/index.js';
export type { QA } from './qa/index.js';
export type { PublishInput, Publisher } from './publisher/index.js';
export type {
  ResearchIngestInput,
  ResearchProvider,
  TextGenerateInput,
  TextGenerateOutput,
  TextProvider,
  GeneratedImage,
  GeneratedImages,
  ImageProvider,
  LLMCompleteInput,
  LLMCompleteOutput,
  LLMPurpose,
  LLMProvider,
  StoragePutInput,
  StorageProvider,
  MarketplacePublishInput,
  MarketplaceProvider,
} from './providers/index.js';
export { FakeImageProvider, FakeLLMProvider } from './providers/index.js';
export type { ImageGenerationPrompt, PromptBuilder, PromptBuilderInput } from './prompts/index.js';
export { DefaultPromptBuilder, buildItemPrompt } from './prompts/index.js';

export type {
  StyleGuide,
  CreativeDirector,
  ProductMetadata,
  ProductMetadataInput,
} from './creative/index.js';
export {
  parseStyleGuide,
  DEFAULT_ILLUSTRATION_COUNT,
  FakeCreativeDirector,
  ETSY_TAG_COUNT,
  parseProductMetadata,
} from './creative/index.js';

export type {
  PaperSize,
  PaperSizeId,
  PosterTemplate,
  PosterTitleStyle,
  Rect,
  PosterLayoutGeometry,
  PreviewGridGeometry,
  LayoutEngine,
  LayoutPosterInput,
} from './layout/index.js';
export {
  PAPER_A4,
  PAPER_US_LETTER,
  PAPER_SIZES,
  resolvePaperSize,
  ETSY_CLASSIC_POSTER_TEMPLATE,
  computePosterLayout,
  computePreviewGrid,
} from './layout/index.js';
