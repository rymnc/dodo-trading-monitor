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
  source: Source<SourcePayload, SourceEvent>;
  sink: Sink<SinkPayload, SinkReceipt>;
  transform: (event: Event<SourceEvent>) => Promise<SinkPayload>;
  run: (payload: SourcePayload) => void;
}
