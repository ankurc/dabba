import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class StripeError extends AppError {
  constructor(
    public statusCode: number,
    public message: string,
    public stripeCode: string
  ) {
    super(statusCode, message);
    Object.setPrototypeOf(this, StripeError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    error: err,
    path: req.path,
    method: req.method,
    body: req.body,
  });

  if (err instanceof StripeError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.stripeCode,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
  });
};

export function handleStripeError(error: any): never {
  if (error.type === 'StripeCardError') {
    throw new StripeError(400, error.message, error.code);
  }
  if (error.type === 'StripeInvalidRequestError') {
    throw new StripeError(400, 'Invalid request to payment service', error.code);
  }
  if (error.type === 'StripeAPIError') {
    throw new StripeError(500, 'Payment service error', error.code);
  }
  throw error;
} 