import {WebSocketProvider} from '@ethersproject/providers';
import {EventEmitter} from 'events'


export async function getProvider(url: string): Promise<WebSocketProvider> {
  return await new Promise((resolve, reject) => {
    let tries: number = 0;
    const providerLoop = () => {
      const errorCatcher = new EventEmitter();
      tries++;
      const provider = new WebSocketProvider(url);
      /**
       * Polyfill ethers.js websocket handlers for robustness
       */
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
        console.error(
          "Could not connect to the Eth Node. Retrying in 5 seconds."
        );
      });
    };
    providerLoop();
    const interval = setInterval(providerLoop, 5000);
  });
}