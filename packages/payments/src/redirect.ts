export interface ClientRedirectInput {
  transactionId?: string;
  status?: string;
  [key: string]: string | undefined;
}

export interface ClientRedirectInterpretation {
  paid: false;
  authoritative: false;
  source: "client_redirect";
  reason: "client_redirect_not_authoritative";
  transactionId?: string;
}

/**
 * Le retour navigateur (return_url) n'est pas une preuve de paiement.
 * Seul verifyPayment, qui appelle /v2/payment/check, peut marquer un paiement payé.
 */
export function interpretClientRedirect(query: ClientRedirectInput): ClientRedirectInterpretation {
  return {
    paid: false,
    authoritative: false,
    source: "client_redirect",
    reason: "client_redirect_not_authoritative",
    transactionId: query.transactionId,
  };
}
