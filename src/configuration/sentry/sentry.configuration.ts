import { INestApplication } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const initSentry = () => {
  const sentryEnabled = process.env.SENTRY_ENABLED === 'true';
  if (sentryEnabled) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      environment: process.env.NODE_ENV,
    });
  }
};

export const sentryConfig = (app: INestApplication) => {
  initSentry();

  const sentryEnabled = process.env.SENTRY_ENABLED === 'true';
  if (sentryEnabled) {
    const { httpAdapter } = app.get(HttpAdapterHost);
    Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));
  }
};
