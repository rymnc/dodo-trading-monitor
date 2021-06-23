import { Sink } from "../types";
import { createTransport, Transporter } from "nodemailer";
import { EmailConstructor, EmailPayload } from "./types";
/**
 * Email Sink Class
 */
export class EmailSink implements Sink<EmailPayload, any> {
  /**
   * Nodemailer transporter
   */
  transport: Transporter;
  /**
   * Id of the sink
   */
  id: number;
  /**
   * Name of the sink
   */
  name: string = "email";
  /**
   * Array of receipts
   */
  receipts: any[];

  /**
   * Constructor
   * @param obj EmailConstructor
   */
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

  /**
   * Returns the email receipts
   * @returns Email receipts
   */
  async getReceipts(): Promise<any[]> {
    return this.receipts;
  }

  /**
   * Sends the email given payload
   * @param payload EmailPayload
   * @returns Boolean
   */
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
