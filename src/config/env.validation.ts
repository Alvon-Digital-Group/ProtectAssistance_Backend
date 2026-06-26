import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().default(3000),

  API_PREFIX: Joi.string().default('api/v1'),

  JWT_SECRET: Joi.string().required(),

  JWT_EXPIRES_IN: Joi.string().default('1d'),

  DATABASE_URL: Joi.string().allow('').optional(),

  CORS_ORIGIN: Joi.string().allow('').optional(),

  FCM_PROJECT_ID: Joi.string().allow('').optional(),

  STORAGE_BUCKET: Joi.string().allow('').optional(),
});
