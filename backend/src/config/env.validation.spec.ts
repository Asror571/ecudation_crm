import { envValidationSchema } from './env.validation';

describe('envValidationSchema', () => {
  const validEnvironment = {
    NODE_ENV: 'test',
    PORT: '3001',
    MONGO_URI: 'mongodb://localhost:27017/education_crm?directConnection=true',
    FRONTEND_URL: 'http://localhost:5173',
    JWT_SECRET: 'a'.repeat(32),
    JWT_REFRESH_SECRET: 'b'.repeat(32),
  };

  it('accepts a complete environment', () => {
    const result = envValidationSchema.validate(validEnvironment);

    expect(result.error).toBeUndefined();
  });

  it('rejects missing secrets and malformed MongoDB URIs', () => {
    const { error } = envValidationSchema.validate(
      {
        ...validEnvironment,
        MONGO_URI: 'http://localhost:27017',
        JWT_SECRET: 'short',
      },
      { abortEarly: false },
    );

    expect(error).toBeDefined();
    expect(error?.details.map(({ path }) => path[0])).toEqual(
      expect.arrayContaining(['MONGO_URI', 'JWT_SECRET']),
    );
  });
});
