import { Sink } from "../types";
import { Transporter } from "nodemailer";
import { EmailConstructor, EmailPayload } from "./types";
export declare class EmailSink implements Sink<EmailPayload, any> {
    transport: Transporter;
    id: number;
    name: string;
    receipts: any[];
    constructor(obj: EmailConstructor);
    getReceipts(): Promise<any[]>;
    send(payload: EmailPayload): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map