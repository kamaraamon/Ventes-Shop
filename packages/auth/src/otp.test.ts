import { describe, expect, it, vi } from "vitest";
import { OtpTransportNotConfigured, resolveOtpSender } from "./otp";

describe("OTP", () => {
  it("journalise le code quand le canal n'est pas choisi", async () => {
    const log = vi.fn();
    const sender = resolveOtpSender({ log });
    expect(sender.channel).toBe("dev-log");
    const result = await sender.send({ to: "+2250700000000", code: "123456" });
    expect(result.delivered).toBe(true);
    expect(log).toHaveBeenCalledWith("[otp:dev-log] code pour +2250700000000 : 123456");
  });

  it("reste branchable sur SMS ou WhatsApp sans en choisir un", async () => {
    const sms = resolveOtpSender({ channel: "sms" });
    await expect(sms.send({ to: "+2250700000000", code: "123456" })).rejects.toBeInstanceOf(OtpTransportNotConfigured);

    const delivered = vi.fn(async () => undefined);
    const whatsapp = resolveOtpSender({
      channel: "whatsapp",
      transports: { whatsapp: { channel: "whatsapp", send: delivered } },
    });
    await whatsapp.send({ to: "+2250700000000", code: "654321" });
    expect(delivered).toHaveBeenCalledOnce();
  });
});
