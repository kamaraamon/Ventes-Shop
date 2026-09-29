export type PaymentChannel = "orange_money" | "mtn_momo" | "wave" | "all";

export interface CreatePaymentInput {
  transactionId: string;
  amountFcfa: number;
  description: string;
  notifyUrl: string;
  returnUrl: string;
  channel?: PaymentChannel;
  customerName?: string;
  customerPhone?: string;
}

export interface CreatePaymentResult {
  transactionId: string;
  /** Jamais « paid » à la création. */
  status: "pending" | "failed";
  paymentUrl: string | null;
  mode: "live" | "stub";
  message: string;
}

export interface VerifyPaymentResult {
  transactionId: string;
  paid: boolean;
  status: "paid" | "pending" | "failed" | "unknown";
  /** La preuve vient toujours de POST /v2/payment/check, côté serveur. */
  source: "cinetpay_check" | "stub";
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(transactionId: string): Promise<VerifyPaymentResult>;
}
