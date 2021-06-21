import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";

/**
 * Interface for the Eth-Email Monitor's constructor
 */
export interface EthEmailConstructor {
  source: EthSource;
  sink: EmailSink;
  from: string;
  to: string;
}
