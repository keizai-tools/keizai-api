import * as Joi from 'joi';

export const configurationValidate = Joi.object({
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  SONAR_SERVER_URL: Joi.string().required(),
  SONAR_TOKEN: Joi.string().required(),
  AWS_ACCESS_KEY: Joi.string().required(),
  AWS_SECRET_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_COGNITO_AUTHORITY: Joi.string().required(),
  AWS_COGNITO_CLIENT_ID: Joi.string().required(),
  AWS_COGNITO_ENDPOINT: Joi.string().required(),
  AWS_COGNITO_USER_POOL_ID: Joi.string().required(),
  AWS_S3_BUCKET: Joi.string().required(),
  AWS_ECS_CLUSTER_NAME: Joi.string().required(),
  AWS_ECS_TASK_DEFINITION: Joi.string().required(),
  AWS_ECS_SUBNETS: Joi.string().required(),
  AWS_ECS_SECURITY_GROUP_ID: Joi.string().required(),
  LAMBDA_ARN: Joi.string().required(),
  PUBLIC_KEY_MAINNET: Joi.string().required(),
  SENTRY_DSN: Joi.string().required(),
  SENTRY_ENABLED: Joi.boolean().required(),
  AWS_FARGATE_COST_PER_GB_RAM: Joi.number().required(),
  AWS_FARGATE_COST_PER_VCPU: Joi.number().required(),
  // Optional in non-production environments
  COGNITO_LOCAL_PATH: Joi.string().optional(),
  MOCKED_PUBLIC_KEY: Joi.string().optional(),
  MOCKED_SECRET_KEY: Joi.string().optional(),
  STELLAR_TESTNET_SOROBAN_DEPLOYER_CONTRACT_ID: Joi.string().optional(),
  STELLAR_FUTURENET_SOROBAN_DEPLOYER_CONTRACT_ID: Joi.string().optional(),
  STELLAR_MAINNET_SOROBAN_DEPLOYER_CONTRACT_ID: Joi.string().optional(),
});
