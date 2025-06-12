// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

const tracesSampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 0;

Sentry.init({
  dsn: 'https://a97aaebdc381cc490458e2dab8919e1f@o4507161283854336.ingest.us.sentry.io/4509405591699456',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
