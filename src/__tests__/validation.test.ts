import { describe, it, expect } from 'vitest';
import { databaseFormSchema, transformationConfigSchema } from '../utils/validation';

describe('Validation Schemas', () => {
  describe('databaseFormSchema', () => {
    it('validates correct data', () => {
      const validData = {
        host: 'localhost',
        port: '3306',
        username: 'root',
        password: 'password123',
        database: 'test_db',
      };

      const result = databaseFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.port).toBe(3306);
      }
    });

    it('rejects invalid data', () => {
      const invalidData = {
        host: '',
        port: '-1',
        username: '',
        password: '',
        database: 'test@db',
      };

      const result = databaseFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('transformationConfigSchema', () => {
    it('uses default values', () => {
      const result = transformationConfigSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          batchSize: 1000,
          validateData: true,
          preserveIds: true,
        });
      }
    });

    it('validates custom values', () => {
      const customConfig = {
        batchSize: 500,
        validateData: false,
        preserveIds: false,
      };

      const result = transformationConfigSchema.safeParse(customConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(customConfig);
      }
    });
  });
});