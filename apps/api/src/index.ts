import { createApp } from './bootstrap/composition-root.js';
import { loadDotEnvIfPresent } from './config/load-dotenv.js';
import { ConfigurationError, loadRuntimeConfig } from './config/runtime-config.js';

loadDotEnvIfPresent();

try {
  const config = loadRuntimeConfig();
  const app = createApp(config);
  console.log(`${app.name} composition ready (provider=${app.composition.config.imageProvider})`);
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error(error.message);
    process.exitCode = 1;
  } else {
    throw error;
  }
}
