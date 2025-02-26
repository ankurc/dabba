import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid request data',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
};

export const paymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  subscriptionId: z.string().uuid(),
}); 