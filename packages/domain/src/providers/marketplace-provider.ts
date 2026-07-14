import type { ProductPackage, PublishPackage } from '../objects/index.js';

/**
 * Marketplace publish input (later automation).
 * Export MVP path does not require a live MarketplaceProvider.
 */
export interface MarketplacePublishInput {
  readonly productPackage: ProductPackage;
}

/**
 * Marketplace provider port for listing/publish operations.
 * Early: unused stub; Publishing automation is post-validation.
 * Strategies must never call this port — only Publisher may.
 */
export interface MarketplaceProvider {
  publish(input: MarketplacePublishInput): Promise<PublishPackage>;
}
