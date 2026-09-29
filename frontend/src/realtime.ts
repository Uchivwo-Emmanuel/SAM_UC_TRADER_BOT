import { useEffect, useState } from "react";
import { appConfig } from "./config";
import type { RealtimeState } from "./types";

/** Cookies authenticate the eventual same-origin websocket; tokens are never placed in URLs or browser storage. */
export function useRealtimeStatus(): RealtimeState {
  const [state, setState] = useState<RealtimeState>(appConfig.useDemoData ? "mock" : "connecting");
  useEffect(() => {
    if (appConfig.useDemoData) return;
    const url = import.meta.env.VITE_REALTIME_BASE_URL;
    if (!url) { setState("offline"); return; }
    let socket: WebSocket | undefined;
    let timer: number | undefined;
    const connect = () => {
      setState("connecting");
      socket = new WebSocket(url);
      socket.onopen = () => setState("connected");
      socket.onclose = () => { setState("stale"); timer = window.setTimeout(connect, 5_000); };
      socket.onerror = () => socket?.close();
    };
    connect();
    return () => { if (timer) window.clearTimeout(timer); socket?.close(); };
  }, []);
  return state;
}
