import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { handleApiError, errorResponse, logError } from '../api-error';

describe('API Error Handling', () => {
  describe('errorResponse', () => {
    it('should create error response with status code', () => {
      const response = errorResponse('Test error', 400, 'TEST_ERROR');
      expect(response.status).toBe(400);
    });

    it('should include error message in response body', async () => {
      const response = errorResponse('Test error', 400, 'TEST_ERROR');
      const body = await response.json();
      expect(body.error).toBe('Test error');
      expect(body.code).toBe('TEST_ERROR');
    });
  });

  describe('handleApiError', () => {
    it('should handle Zod validation errors', async () => {
      const schema = z.object({ name: z.string() });
      try {
        schema.parse({ name: 123 });
      } catch (error) {
        const response = handleApiError(error, 'Test Context');
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should handle Prisma unique constraint errors', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      );
      const response = handleApiError(error, 'Test Context');
      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.code).toBe('DUPLICATE_RECORD');
    });

    it('should handle Prisma not found errors', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        }
      );
      const response = handleApiError(error, 'Test Context');
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('should handle generic errors', async () => {
      const error = new Error('Something went wrong');
      const response = handleApiError(error, 'Test Context');
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('logError', () => {
    it('should log error without throwing', () => {
      expect(() => {
        logError('Test Context', new Error('Test error'), { userId: '123' });
      }).not.toThrow();
    });
  });
});
