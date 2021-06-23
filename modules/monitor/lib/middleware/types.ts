import { Source, Event } from "../sources/types";
import { Sink } from "../sinks/types";

/**
 * All Middlewares must implement the following interface
 */
export interface Middleware<
  SourcePayload,
  SourceEvent,
  SinkPayload,
  SinkReceipt
> {
  /**
   * Source that emits events
   */
  source: Source<SourcePayload, SourceEvent>;
  /**
   * Sink that receives events
   */
  sink: Sink<SinkPayload, SinkReceipt>;
  /**
   * Function that transforms the source event to the sink payload
   */
  transform: (event: Event<SourceEvent>) => Promise<SinkPayload>;
  /**
   * Function that runs the middleware
   */
  run: (payload: SourcePayload) => void;
}
