import { Sink, NotificationPayload } from "./types";
import { Transporter } from "nodemailer";
interface EmailConstructor {
    email: string;
    pass: string;
    host: string;
    id: number;
}
interface EmailPayload extends NotificationPayload {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
export declare class EmailSink implements Sink<EmailPayload, any> {
    transport: Transporter;
    id: number;
    name: string;
    receipts: any[];
    constructor(obj: EmailConstructor);
    getReceipts(): Promise<any[]>;
    send(payload: EmailPayload): Promise<boolean>;
}
export {};
//# sourceMappingURL=email.d.ts.map