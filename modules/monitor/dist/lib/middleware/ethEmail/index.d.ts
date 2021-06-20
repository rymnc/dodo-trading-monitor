import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";
import { SubscribePayload } from "../../sources/eth/types";
import { EmailPayload } from "../../sinks/email/types";
import { Middleware } from "../types";
import { Event } from "../../sources/types";
interface EthEmailConstructor {
    source: EthSource;
    sink: EmailSink;
    from: string;
    to: string;
}
export declare class EthEmail implements Middleware<SubscribePayload, any, EmailPayload, any> {
    source: EthSource;
    sink: EmailSink;
    from: string;
    to: string;
    constructor(obj: EthEmailConstructor);
    transform(event: Event<any>): Promise<EmailPayload>;
    run(payload: SubscribePayload): void;
}
export {};
//# sourceMappingURL=index.d.ts.map