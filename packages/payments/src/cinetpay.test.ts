import { describe, expect, it, vi } from "vitest";
import { CinetPayProvider, interpretClientRedirect } from "./index";

describe("CinetPay", () => {
  it("ne traite jamais une redirection navigateur comme un paiement reçu", () => {
    const result = interpretClientRedirect({ transactionId: "tx-1", status: "ACCEPTED" });
    expect(result.paid).toBe(false);
    expect(result.reason).toBe("client_redirect_not_authoritative");
  });

  it("sans clés, create et check restent en attente et n'appellent pas le réseau", async () => {
    const fetchImpl = vi.fn();
    const provider = new CinetPayProvider({ fetchImpl });
    const created = await provider.createPayment({
      transactionId: "tx-2",
      amountFcfa: 12000,
      description: "Acompte fictif",
      notifyUrl: "https://example.test/notify",
      returnUrl: "https://example.test/return",
    });
    expect(created.mode).toBe("stub");
    expect(created.status).toBe("pending");
    expect(created.paymentUrl).toBeNull();
    const verified = await provider.verifyPayment("tx-2");
    expect(verified.paid).toBe(false);
    expect(verified.source).toBe("stub");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("confirme uniquement via POST /v2/payment/check", async () => {
    const fetchImpl = vi.fn(async (url: string | URL | Request) => {
      const href = String(url);
      expect(href).toContain("/v2/payment/check");
      expect(href).not.toContain("/return");
      return new Response(JSON.stringify({ code: "00", data: { status: "ACCEPTED", amount: 12000 } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    const provider = new CinetPayProvider({ apiKey: "test-key", siteId: "site", fetchImpl });
    const verified = await provider.verifyPayment("tx-3");
    expect(verified).toEqual({ transactionId: "tx-3", paid: true, status: "paid", source: "cinetpay_check" });
  });
});
