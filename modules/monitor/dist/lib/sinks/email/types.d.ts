import { SinkPayload } from "../types";
export interface EmailConstructor {
    email: string;
    pass: string;
    host: string;
    id: number;
}
export interface EmailPayload extends SinkPayload {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
//# sourceMappingURL=types.d.ts.map