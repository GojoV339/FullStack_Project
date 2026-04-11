import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

/**
 * Log error with context
 */
export function logError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, unknown>
) {
  console.error(`[${context}]`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...additionalInfo,
  });
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(
  error: unknown,
  context: string,
  additionalInfo?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  // Log the error with context
  logError(context, error, additionalInfo);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors[0].message,
        code: 'VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Resource already exists',
          details: 'A record with this value already exists',
          code: 'DUPLICATE_RECORD',
        },
        { status: 409 }
      );
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Resource not found',
          details: 'The requested resource does not exist',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Invalid reference',
          details: 'Referenced resource does not exist',
          code: 'INVALID_REFERENCE',
        },
        { status: 400 }
      );
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Database validation error',
        details: 'Invalid data provided',
        code: 'DB_VALIDATION_ERROR',
      },
      { status: 400 }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  // Unknown error type
  return NextResponse.json(
    {
      error: 'Internal server error',
      details: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Create error response with specific status code
 */
export function errorResponse(
  message: string,
  status: number,
  code?: string,
  details?: string
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      ...(code && { code }),
    },
    { status }
  );
}
