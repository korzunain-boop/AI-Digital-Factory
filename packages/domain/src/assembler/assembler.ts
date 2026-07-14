import type { AssetBundle, ProductPackage, ResearchBrief } from '../objects/index.js';
import type { GeneratorTemplateParams } from '../objects/generator-template.js';

/**
 * Input to the Assembler stage.
 * Assets plus optional brief/template metadata needed for packaging.
 */
export interface AssembleInput {
  readonly assetBundle: AssetBundle;
  readonly researchBrief?: ResearchBrief;
  readonly template?: GeneratorTemplateParams;
}

/**
 * Assembler contract: turn raw AssetBundle into a sellable ProductPackage.
 *
 * Responsibilities (SYSTEM.md):
 * - package files
 * - create ZIP
 * - create preview images
 * - generate metadata package
 * - generate PDFs if required
 *
 * Does not generate creative assets (GeneratorStrategy does that).
 * Behavior is implemented later — contract only in M2.
 */
export interface Assembler {
  assemble(input: AssembleInput): Promise<ProductPackage>;
}
