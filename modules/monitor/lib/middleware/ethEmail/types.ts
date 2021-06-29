import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";
import { EthConstructor } from "../../sources/eth/types";
import { EmailConstructor } from "../../sinks/email/types";

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

/**
 * Combined interface for one-off creation
 */
export interface EthEmailCombined extends EthConstructor, EmailConstructor {}
