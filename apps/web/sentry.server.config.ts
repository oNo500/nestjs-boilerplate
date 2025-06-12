// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

const tracesSampleRate = process.env.NODE_ENV === 'production' ? 0.1 : 0;

Sentry.init({
  dsn: 'https://a97aaebdc381cc490458e2dab8919e1f@o4507161283854336.ingest.us.sentry.io/4509405591699456',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  environment: process.env.NODE_ENV ? process.env.NODE_ENV : '',
});
