"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailSink = void 0;
const nodemailer_1 = require("nodemailer");
class EmailSink {
    constructor(obj) {
        Object.defineProperty(this, "transport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "email"
        });
        Object.defineProperty(this, "receipts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = obj.id;
        this.receipts = [];
        this.transport = nodemailer_1.createTransport({
            host: obj.host,
            port: process.env.NODE_ENV === "test" ? 587 : 465,
            secure: process.env.NODE_ENV === "test" ? false : true,
            auth: {
                user: obj.email,
                pass: obj.pass,
            },
        });
    }
    async getReceipts() {
        return this.receipts;
    }
    async send(payload) {
        try {
            const slug = {
                from: payload.from,
                to: payload.to,
            };
            Object.assign(slug, payload);
            const receipt = await this.transport.sendMail(slug);
            this.receipts.push(receipt);
            return true;
        }
        catch (e) {
            return false;
        }
    }
}
exports.EmailSink = EmailSink;
