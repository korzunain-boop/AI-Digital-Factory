import type { ProductPackage, PublishMode, PublishPackage } from '../objects/index.js';

/**
 * Input to the Publisher stage.
 * Only QA-passed packages should flow here under normal orchestration.
 */
export interface PublishInput {
  readonly productPackage: ProductPackage;
  /** MVP default is export. */
  readonly mode: PublishMode;
}

/**
 * Publisher contract with two modes:
 * - export: listing package for manual upload (MVP)
 * - marketplace: automated publish via MarketplaceProvider (later)
 *
 * Behavior is implemented later — contract only in M2.
 */
export interface Publisher {
  publish(input: PublishInput): Promise<PublishPackage>;
}
