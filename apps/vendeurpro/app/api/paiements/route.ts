import { CinetPayProvider, interpretClientRedirect } from "@vpct/payments";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    amountFcfa?: number;
    description?: string;
    channel?: "orange_money" | "mtn_momo" | "wave";
    customerName?: string;
    customerPhone?: string;
  };
  const provider = new CinetPayProvider({
    apiKey: process.env.CINETPAY_API_KEY,
    siteId: process.env.CINETPAY_SITE_ID,
  });
  const transactionId = crypto.randomUUID();
  const created = await provider.createPayment({
    transactionId,
    amountFcfa: body.amountFcfa ?? 0,
    description: body.description ?? "Acompte",
    notifyUrl: process.env.CINETPAY_NOTIFY_URL ?? "http://127.0.0.1:43123/api/paiements",
    returnUrl: process.env.CINETPAY_RETURN_URL ?? "http://127.0.0.1:43123/commandes/nouvelle",
    channel: body.channel,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
  });
  return NextResponse.json({
    ...created,
    clientReturn: interpretClientRedirect({ transactionId, status: "ACCEPTED" }),
  });
}

export async function GET(request: Request) {
  const transactionId = new URL(request.url).searchParams.get("transactionId");
  if (!transactionId) {
    return NextResponse.json({ paid: false, reason: "transaction_id_manquant" }, { status: 400 });
  }
  const provider = new CinetPayProvider({
    apiKey: process.env.CINETPAY_API_KEY,
    siteId: process.env.CINETPAY_SITE_ID,
  });
  const verified = await provider.verifyPayment(transactionId);
  return NextResponse.json(verified);
}
