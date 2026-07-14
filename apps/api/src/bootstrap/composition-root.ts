/**
 * Composition root — reserved for dependency injection and application startup.
 * Empty in M1: wires nothing yet.
 */
export type AppShell = {
  name: string;
};

export function createApp(): AppShell {
  return {
    name: 'ai-product-factory-api',
  };
}
