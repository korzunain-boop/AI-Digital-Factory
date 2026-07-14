import { createApp } from './bootstrap/composition-root.js';

/**
 * API process entry — M1 skeleton only.
 * No HTTP server or routes yet.
 */
function main(): void {
  const app = createApp();
  console.log(`[api] ${app.name} skeleton booted (milestone M1)`);
}

main();
