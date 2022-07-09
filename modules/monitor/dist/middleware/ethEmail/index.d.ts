import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";
import { SubscribePayload } from "../../sources/eth/types";
import { EmailPayload } from "../../sinks/email/types";
import { Middleware } from "../types";
import { Event } from "../../sources/types";
import { EthEmailCombined, EthEmailConstructor } from "./types";
export declare class EthEmail implements Middleware<SubscribePayload, any, EmailPayload, any> {
    source: EthSource;
    sink: EmailSink;
    from: string;
    to: string;
    constructor(obj: EthEmailConstructor);
    getAddressUrl(address: string): string;
    transform(event: Event<any>): Promise<EmailPayload>;
    run(payload: SubscribePayload): void;
}
export declare const createEthEmailMonitor: (obj: EthEmailCombined & {
    from: string;
    to: string;
}) => Promise<EthEmail>;
