import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  API_PREFIX: Joi.string().default('api/v1'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
  
  DATABASE_URL: Joi.string().required(),
  
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  
  BCRYPT_ROUNDS: Joi.number().default(12),
  
  GOOGLE_PLACES_API_KEY: Joi.string().allow('').optional(),
  GOOGLE_MAPS_API_KEY: Joi.string().allow('').optional(),
  
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().allow('').optional(),
  SMTP_PASS: Joi.string().allow('').optional(),
  SMTP_FROM: Joi.string().default('BizOptics <noreply@bizoptics.com>'),
  
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  
  ANALYSIS_TIMEOUT_MS: Joi.number().default(10000),
  LOG_LEVEL: Joi.string().default('debug'),
});
