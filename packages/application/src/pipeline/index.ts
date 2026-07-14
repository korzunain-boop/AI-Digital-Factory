/**
 * Pipeline execution skeleton (Milestone M5).
 */

export type {
  StageResult,
  StageSuccess,
  StageFailure,
  StageSkipped,
  StageArtifactIds,
} from './stage-result.js';
export { stageSuccess, stageFailure, stageSkipped } from './stage-result.js';

export type { PipelineRunContext } from './pipeline-run-context.js';
export type { PipelineStageRunner } from './pipeline-stage-runner.js';

export {
  ensureJobStages,
  applyStageResult,
  skipRemainingStages,
  finalizeJobStatus,
  pipelineStageOrder,
} from './job-stage-updates.js';

export { PipelineExecutor } from './pipeline-executor.js';

export { GeneratorStageRunner } from './stages/generator-stage-runner.js';
export {
  ResearchStageRunner,
  AssemblerStageRunner,
  QAStageRunner,
  PublisherStageRunner,
} from './stages/placeholder-stage-runners.js';

export {
  NotImplementedResearchProvider,
  NotImplementedAssembler,
  NotImplementedQA,
  NotImplementedPublisher,
} from './placeholders/not-implemented-stages.js';
