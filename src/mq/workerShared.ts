import type { ConsumeMessage, Channel } from "amqplib";

export function attempts(msg: ConsumeMessage): number {
  const death = msg.properties.headers?.["x-death"];
  if (!Array.isArray(death)) return 0;
  return death.reduce((acc: number, d: any) => acc + (Number(d?.count) || 0), 0);
}

export function retryable(e: any): boolean {
  const s = e?.status ?? e?.response?.status;
  const code = e?.code;
  if (typeof s === "number") {
    if (s >= 500 || s === 429) return true;
    return false;
  }
  if (code && String(code).startsWith("ECONN")) return true;
  return true;
}

export function nackToRetry(ch: Channel, msg: ConsumeMessage) { ch.nack(msg, false, false); } // vai p/ *.retry
export function rejectToDlq(ch: Channel, msg: ConsumeMessage) { ch.reject(msg, false); }      // vai p/ *.dlq