import { EthSource } from "../../sources";
import { EmailSink } from "../../sinks";
import { SubscribePayload } from "../../sources/eth/types";
import { EmailPayload } from "../../sinks/email/types";
import { Middleware } from "../types";
import { Event } from "../../sources/types";
import { isAddress } from "@ethersproject/address";
import { EthEmailCombined, EthEmailConstructor } from "./types";

/**
 * Eth-Email Monitor Class
 */
export class EthEmail
  implements Middleware<SubscribePayload, any, EmailPayload, any>
{
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

  /**
   * Constructor
   * @param obj EthEmailConstructor
   */
  constructor(obj: EthEmailConstructor) {
    this.source = obj.source;
    this.sink = obj.sink;
    this.from = obj.from;
    this.to = obj.to;
  }

  /**
   * Checks if input value is an address, if so
   * it generates the etherscan url based on the
   * provider network
   * @param address Ethereum address
   * @return string
   */
  getAddressUrl(address: string): string {
    let url: string = `etherscan.io/address/${address}`;
    const networkName: string = this.source.provider.network.name;
    switch (networkName) {
      case "homestead":
        url = `https://${url}`;
        break;
      case "ropsten":
      case "rinkeby":
      case "kovan":
      case "goerli":
        url = `https://${networkName}.${url}`;
        break;
      default:
        url = "";
    }
    return url;
  }

  /**
   * Transforms the Ethereum Event into EmailPayload
   * @param event Event<any>
   * @returns EmailPayload
   */
  async transform(event: Event<any>): Promise<EmailPayload> {
    // Get the string keys for the event
    const keys = Object.keys(event.details).filter((v) =>
      Number.isNaN(Number(v))
    );

    const coerceToUrlIfAddress = (value: string): string => {
      if (isAddress(value)) {
        return this.getAddressUrl(value);
      }
      return "";
    };

    // Create a table of parameters thrown by the event
    const tableOfDetails = keys
      .map((k) => {
        const value = event.details[k];
        const url = coerceToUrlIfAddress(value);
        return `<tr><td> ${k} </td> <td> ${
          url !== "" ? `<a href=${url}>${value}</a>` : value
        } </td></tr>`;
      })
      .join("");

    const contractUrl = this.getAddressUrl(event.address);

    return {
      from: this.from,
      to: this.to,
      subject: `${event.type} Triggered`,
      html: `<p> An Event has been triggered <br>
                Contract: ${
                  contractUrl !== ""
                    ? `<a href= ${contractUrl}> ${event.address} </a>`
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

  /**
   * Main Runner function for the monitor
   * It is imperative to bind functions to the correct context,
   * if using them in callback
   * @param payload SubscribePayload
   */
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

export const createEthEmailMonitor = async (
  obj: EthEmailCombined & { from: string; to: string }
) => {
  return new EthEmail({
    source: new EthSource({
      id: obj.id,
      provider: obj.provider,
      registry: obj.registry,
    }),
    sink: new EmailSink({
      id: obj.id + 1,
      email: obj.email,
      host: obj.host,
      pass: obj.pass,
    }),
    from: obj.from,
    to: obj.to,
  });
};
