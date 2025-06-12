// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { replayIntegration } from '@sentry/browser';
import * as Sentry from '@sentry/nextjs';
import { captureRouterTransitionStart } from '@sentry/nextjs';

if (process.env.NODE_ENV !== 'development') {
  // registerOTel({ serviceName: 'nextjs-app' });
  Sentry.init({
    dsn: 'https://a97aaebdc381cc490458e2dab8919e1f@o4507161283854336.ingest.us.sentry.io/4509405591699456',

    // Add optional integrations for additional features
    integrations: [replayIntegration()],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}

export const onRouterTransitionStart = captureRouterTransitionStart;
