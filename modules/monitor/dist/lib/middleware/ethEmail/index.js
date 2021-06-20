"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthEmail = void 0;
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
    async transform(event) {
        const keys = Object.keys(event.details).filter((v) => Number.isNaN(Number(v)));
        const tableOfDetails = keys
            .map((k) => {
            return `<tr><td> ${k} </td> <td> ${event.details[k]} </td></tr>`;
        })
            .join("");
        return {
            from: this.from,
            to: this.to,
            subject: `${event.type} Triggered`,
            html: `<p> An Event has been triggered <br>
                Contract: ${event.address} <br>
                Event Type: ${event.type} <br>
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
                details: event,
            };
            const emailPayload = await boundTransform(slug);
            await this.sink.send(emailPayload);
        });
    }
}
exports.EthEmail = EthEmail;
//# sourceMappingURL=index.js.map