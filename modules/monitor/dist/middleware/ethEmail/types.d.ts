import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";
import { EthConstructor } from "../../sources/eth/types";
import { EmailConstructor } from "../../sinks/email/types";
export interface EthEmailConstructor {
    source: EthSource;
    sink: EmailSink;
    from: string;
    to: string;
}
export interface EthEmailCombined extends EthConstructor, EmailConstructor {
}
