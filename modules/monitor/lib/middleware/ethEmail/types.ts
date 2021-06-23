import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";

/**
 * Interface for the Eth-Email Monitor's constructor
 */
export interface EthEmailConstructor {
  /**
   * Ethereum Source
   */
  source: EthSource;
  /**
   * Email Sink
   */
  sink: EmailSink;
  /**
   * Source email address
   */
  from: string;
  /**
   * Destination email address
   */
  to: string;
}
