import { interpretClientRedirect } from "./redirect";
import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider, VerifyPaymentResult } from "./types";

const DEFAULT_BASE = "https://api-checkout.cinetpay.com";

export interface CinetPayConfig {
  apiKey?: string;
  siteId?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

interface CheckResponse {
  code?: string;
  message?: string;
  data?: { status?: string; amount?: number };
}

export class CinetPayProvider implements PaymentProvider {
  private readonly apiKey?: string;
  private readonly siteId?: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: CinetPayConfig = {}) {
    this.apiKey = config.apiKey?.trim() || undefined;
    this.siteId = config.siteId?.trim() || undefined;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE).replace(/\/$/, "");
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  get configured(): boolean {
    return Boolean(this.apiKey && this.siteId);
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.configured) {
      return {
        transactionId: input.transactionId,
        status: "pending",
        paymentUrl: null,
        mode: "stub",
        message: "CinetPay non configuré : paiement laissé en attente, aucun débit.",
      };
    }

    const body = {
      apikey: this.apiKey,
      site_id: this.siteId,
      transaction_id: input.transactionId,
      amount: input.amountFcfa,
      currency: "XOF",
      description: input.description,
      notify_url: input.notifyUrl,
      return_url: input.returnUrl,
      channels: input.channel === "all" || !input.channel ? "ALL" : input.channel.toUpperCase(),
      lang: "fr",
      customer_name: input.customerName ?? "",
      customer_phone_number: input.customerPhone ?? "",
      customer_country: "CI",
    };

    const response = await this.fetchImpl(`${this.baseUrl}/v2/payment`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json()) as { code?: string; data?: { payment_url?: string }; message?: string };
    if (json.code !== "201" || !json.data?.payment_url) {
      return {
        transactionId: input.transactionId,
        status: "failed",
        paymentUrl: null,
        mode: "live",
        message: json.message ?? "Initialisation CinetPay refusée",
      };
    }
    return {
      transactionId: input.transactionId,
      status: "pending",
      paymentUrl: json.data.payment_url,
      mode: "live",
      message: "Lien créé. Le paiement n'est pas confirmé tant que /v2/payment/check ne l'a pas vérifié.",
    };
  }

  async verifyPayment(transactionId: string): Promise<VerifyPaymentResult> {
    if (!this.configured) {
      return { transactionId, paid: false, status: "pending", source: "stub" };
    }
    const response = await this.fetchImpl(`${this.baseUrl}/v2/payment/check`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        apikey: this.apiKey,
        site_id: this.siteId,
        transaction_id: transactionId,
      }),
    });
    const json = (await response.json()) as CheckResponse;
    const accepted = json.code === "00" && json.data?.status === "ACCEPTED";
    if (accepted) return { transactionId, paid: true, status: "paid", source: "cinetpay_check" };
    if (json.data?.status === "REFUSED") return { transactionId, paid: false, status: "failed", source: "cinetpay_check" };
    return { transactionId, paid: false, status: "pending", source: "cinetpay_check" };
  }
}

export function paymentProviderFromEnv(env: NodeJS.ProcessEnv = process.env, fetchImpl?: typeof fetch): CinetPayProvider {
  return new CinetPayProvider({
    apiKey: env.CINETPAY_API_KEY,
    siteId: env.CINETPAY_SITE_ID,
    fetchImpl,
  });
}

export { interpretClientRedirect };
