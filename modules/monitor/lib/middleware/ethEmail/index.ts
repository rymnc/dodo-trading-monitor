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

export class EthEmail
  implements Middleware<SubscribePayload, any, EmailPayload, any>
{
  source: EthSource;
  sink: EmailSink;
  from: string;
  to: string;

  constructor(obj: EthEmailConstructor) {
    this.source = obj.source;
    this.sink = obj.sink;
    this.from = obj.from;
    this.to = obj.to;
  }

  async transform(event: Event<any>): Promise<EmailPayload> {
    return {
      from: this.from,
      to: this.to,
      subject: `${event.type} Triggered`,
      html: `<p> An Event has been triggered <br>
                Contract: ${event.address} <br>
                Event Type: ${event.type} <br>
                Details: ${JSON.stringify(event.details)} <br>
             </p>`,
    };
  }

  run(payload: SubscribePayload) {
    const boundTransform = this.transform.bind(this);
    this.source.subscribe(payload, async (event) => {
      const emailPayload = await boundTransform(event);
      await this.sink.send(emailPayload);
    });
  }
}
