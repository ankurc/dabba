export interface PaymentIntentRequest {
  amount: number;
  currency: string;
  subscriptionId: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

export interface SuccessResponse<T> {
  data: T;
} 