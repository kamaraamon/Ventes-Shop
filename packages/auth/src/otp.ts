/** Canal non choisi : SMS ou WhatsApp Business. Vide = journal de développement. */
export type OtpChannel = "sms" | "whatsapp";

export interface OtpMessage {
  to: string;
  code: string;
}

export interface OtpSendResult {
  delivered: boolean;
  channel: OtpChannel | "dev-log";
}

export interface OtpSender {
  readonly channel: OtpChannel | "dev-log";
  send(message: OtpMessage): Promise<OtpSendResult>;
}

export interface OtpTransport {
  readonly channel: OtpChannel;
  send(message: OtpMessage): Promise<void>;
}

export class OtpTransportNotConfigured extends Error {
  constructor(channel: OtpChannel) {
    super(
      `Canal OTP « ${channel} » demandé, mais aucun transport n'est branché. SMS et WhatsApp Business restent à décider.`,
    );
    this.name = "OtpTransportNotConfigured";
  }
}

export class DevLogOtpSender implements OtpSender {
  readonly channel = "dev-log" as const;
  constructor(private readonly log: (message: string) => void = console.info) {}

  async send(message: OtpMessage): Promise<OtpSendResult> {
    this.log(`[otp:dev-log] code pour ${message.to} : ${message.code}`);
    return { delivered: true, channel: "dev-log" };
  }
}

class TransportOtpSender implements OtpSender {
  readonly channel: OtpChannel;
  constructor(private readonly transport: OtpTransport) {
    this.channel = transport.channel;
  }
  async send(message: OtpMessage): Promise<OtpSendResult> {
    await this.transport.send(message);
    return { delivered: true, channel: this.channel };
  }
}

class MissingTransportSender implements OtpSender {
  readonly channel: OtpChannel;
  constructor(channel: OtpChannel) {
    this.channel = channel;
  }
  async send(): Promise<OtpSendResult> {
    throw new OtpTransportNotConfigured(this.channel);
  }
}

export function resolveOtpSender(options: {
  channel?: string;
  transports?: Partial<Record<OtpChannel, OtpTransport>>;
  log?: (message: string) => void;
}): OtpSender {
  const channel = options.channel?.trim();
  if (!channel) return new DevLogOtpSender(options.log);
  if (channel !== "sms" && channel !== "whatsapp") {
    throw new Error(`OTP_CHANNEL inconnu : ${channel}. Valeurs attendues : sms, whatsapp, ou vide.`);
  }
  const transport = options.transports?.[channel];
  if (!transport) return new MissingTransportSender(channel);
  return new TransportOtpSender(transport);
}
