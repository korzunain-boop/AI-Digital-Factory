/**
 * Composition root — reserved for dependency injection and application startup.
 *
 * Future wiring (not M3): construct Infrastructure adapters, inject into
 * Application use cases (CreateJob, RunPipeline, RetryPipelineStage, CancelJob,
 * ExportProduct), and expose them to the API layer.
 *
 * Empty in M1–M3: wires nothing yet.
 */
export type AppShell = {
  name: string;
};

export function createApp(): AppShell {
  return {
    name: 'ai-product-factory-api',
  };
}
