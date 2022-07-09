"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = void 0;
const providers_1 = require("@ethersproject/providers");
const events_1 = require("events");
async function getProvider(url) {
    return await new Promise((resolve, reject) => {
        let tries = 0;
        const providerLoop = () => {
            const errorCatcher = new events_1.EventEmitter();
            tries++;
            const provider = new providers_1.WebSocketProvider(url);
            provider._websocket.onopen = () => {
                provider._wsReady = true;
                resolve(provider);
                clearInterval(interval);
                Object.keys(provider._requests).forEach((id) => {
                    provider._websocket.send(provider._requests[id].payload);
                });
            };
            provider._websocket.onerror = () => {
                errorCatcher.emit("error");
                provider.destroy();
            };
            errorCatcher.on("error", () => {
                if (tries > 3) {
                    reject("Could not connect to the Eth Node");
                    clearInterval(interval);
                }
                console.error("Could not connect to the Eth Node. Retrying in 5 seconds.");
            });
        };
        providerLoop();
        const interval = setInterval(providerLoop, 5000);
    });
}
exports.getProvider = getProvider;
