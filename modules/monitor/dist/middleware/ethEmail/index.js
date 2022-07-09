"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEthEmailMonitor = exports.EthEmail = void 0;
const sources_1 = require("../../sources");
const sinks_1 = require("../../sinks");
const address_1 = require("@ethersproject/address");
class EthEmail {
    constructor(obj) {
        Object.defineProperty(this, "source", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sink", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "from", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "to", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.source = obj.source;
        this.sink = obj.sink;
        this.from = obj.from;
        this.to = obj.to;
    }
    getAddressUrl(address) {
        let url = `etherscan.io/address/${address}`;
        const networkName = this.source.provider.network.name;
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
    async transform(event) {
        const keys = Object.keys(event.details).filter((v) => Number.isNaN(Number(v)));
        const coerceToUrlIfAddress = (value) => {
            if ((0, address_1.isAddress)(value)) {
                return this.getAddressUrl(value);
            }
            return "";
        };
        const tableOfDetails = keys
            .map((k) => {
            const value = event.details[k];
            const url = coerceToUrlIfAddress(value);
            return `<tr><td> ${k} </td> <td> ${url !== "" ? `<a href=${url}>${value}</a>` : value} </td></tr>`;
        })
            .join("");
        const contractUrl = this.getAddressUrl(event.address);
        return {
            from: this.from,
            to: this.to,
            subject: `${event.type} Triggered`,
            html: `<p> An Event has been triggered <br>
                Contract: ${contractUrl !== ""
                ? `<a href= ${contractUrl}> ${event.address} </a>`
                : event.address} <br>
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
    run(payload) {
        const boundTransform = this.transform.bind(this);
        this.source.subscribe(payload, async (event) => {
            const slug = {
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
exports.EthEmail = EthEmail;
const createEthEmailMonitor = async (obj) => {
    return new EthEmail({
        source: new sources_1.EthSource({
            id: obj.id,
            provider: obj.provider,
            registry: obj.registry,
        }),
        sink: new sinks_1.EmailSink({
            id: obj.id + 1,
            email: obj.email,
            host: obj.host,
            pass: obj.pass,
        }),
        from: obj.from,
        to: obj.to,
    });
};
exports.createEthEmailMonitor = createEthEmailMonitor;
