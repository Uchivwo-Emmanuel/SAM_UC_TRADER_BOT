import WebSocket from "ws";
import { config } from "./config.js";
import { isAllowedInstrument, type AllowedInstrument } from "./instruments.js";

export class DemoDerivClient {
  #socket?: WebSocket;
  connect(): Promise<void> {
    if (config.LIVE_TRADING_ENABLED || config.DERIV_ACCOUNT_MODE !== "demo") throw new Error("Deriv client is demo-only");
    if (!config.DERIV_APP_ID || !config.DERIV_API_TOKEN) throw new Error("Demo Deriv credentials are required");
    return new Promise((resolve, reject) => {
      this.#socket = new WebSocket(`${config.DERIV_WEBSOCKET_URL}?app_id=${config.DERIV_APP_ID}`);
      this.#socket.once("open", () => resolve());
      this.#socket.once("error", reject);
    });
  }
  subscribe(instrument: AllowedInstrument) {
    if (!isAllowedInstrument(instrument)) throw new Error("Instrument is not allowlisted");
    this.#socket?.send(JSON.stringify({ ticks: instrument, subscribe: 1 }));
  }
  close() { this.#socket?.close(); }
}
