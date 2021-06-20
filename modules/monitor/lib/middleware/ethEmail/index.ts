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

  getContractUrl(address: string): string {
    let url: string = `etherscan.io/address/${address}`;
    const networkName: string = this.source.provider.network.name;
    switch (networkName) {
      case "homestead":
        url = `https://${url}`;
        break;
      case "ropsten" || "rinkeby" || "kovan" || "goerli":
        url = `https://${networkName}.${url}`;
        break;
      default:
        url = "";
    }
    return url;
  }

  async transform(event: Event<any>): Promise<EmailPayload> {
    // Get the string keys for the event
    const keys = Object.keys(event.details).filter((v) =>
      Number.isNaN(Number(v))
    );

    const tableOfDetails = keys
      .map((k) => {
        return `<tr><td> ${k} </td> <td> ${event.details[k]} </td></tr>`;
      })
      .join("");

    const contractUrl = this.getContractUrl(event.address);

    return {
      from: this.from,
      to: this.to,
      subject: `${event.type} Triggered`,
      html: `<p> An Event has been triggered <br>
                Contract: ${
                  contractUrl !== ""
                    ? `<a href= ${contractUrl}> ${event.address}`
                    : event.address
                } <br>
                Event Type: ${event.type} <br>
                Contract Label: ${event.label} <br>
                Details: <br>
              </p>
                <table border="1" style='border-collapse:collapse;'>
                  <thead>
                    <th> Parameter </th>
                    <th> Value </th>
                  </thead>
                  ${tableOfDetails}
                </table>
                `,
    };
  }

  run(payload: SubscribePayload) {
    const boundTransform = this.transform.bind(this);
    this.source.subscribe(payload, async (event) => {
      const slug: Event<any> = {
        type: payload.type,
        address: payload.address,
        label: payload.label,
        details: event,
      };
      const emailPayload = await boundTransform(slug);
      await this.sink.send(emailPayload);
    });
  }
}
