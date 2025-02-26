import { Request, Response } from 'express';
import { validateRequest, paymentIntentSchema } from '../../middleware/validate';

describe('validateRequest middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should pass validation for valid data', async () => {
    mockReq.body = {
      amount: 1000,
      currency: 'usd',
      subscriptionId: '123e4567-e89b-12d3-a456-426614174000',
    };

    await validateRequest(paymentIntentSchema)(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid data', async () => {
    mockReq.body = {
      amount: -100, // Invalid: negative amount
      currency: 'us', // Invalid: wrong length
      subscriptionId: 'invalid-uuid',
    };

    await validateRequest(paymentIntentSchema)(
      mockReq as Request,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid request data',
      })
    );
  });
}); 