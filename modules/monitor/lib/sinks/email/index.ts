import { Sink } from "../types";
import { createTransport, Transporter } from "nodemailer";
import { EmailConstructor, EmailPayload } from "./types";

export class EmailSink implements Sink<EmailPayload, any> {
  transport: Transporter;
  id: number;
  name: string = "email";
  receipts: any[];

  constructor(obj: EmailConstructor) {
    this.id = obj.id;
    this.receipts = [];
    this.transport = createTransport({
      host: obj.host,
      port: process.env.NODE_ENV === "test" ? 587 : 465,
      secure: process.env.NODE_ENV === "test" ? false : true,
      auth: {
        user: obj.email,
        pass: obj.pass,
      },
    });
  }

  async getReceipts() {
    return this.receipts;
  }

  async send(payload: EmailPayload): Promise<boolean> {
    try {
      const slug = {
        from: payload.from,
        to: payload.to,
      };
      Object.assign(slug, payload);
      const receipt = await this.transport.sendMail(slug);
      this.receipts.push(receipt);
      return true;
    } catch (e) {
      return false;
    }
  }
}
