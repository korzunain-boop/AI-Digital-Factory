/**
 * Clipart commercial generator (Milestone M6 skeleton).
 */
export type { ClipartGeneratorTemplate } from './clipart-template.js';
export {
  CLIPART_STRATEGY_KEY,
  parseClipartTemplate,
  toClipartTemplateParams,
} from './clipart-template.js';
export { ClipartGeneratorStrategy, buildClipartAssetBundle } from './clipart-generator-strategy.js';
