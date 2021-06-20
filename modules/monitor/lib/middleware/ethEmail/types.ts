import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";

export interface EthEmailConstructor {
  source: EthSource;
  sink: EmailSink;
  from: string;
  to: string;
}
