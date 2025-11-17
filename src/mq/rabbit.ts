import * as amqp from "amqplib";

export const EX_CMD = "nf.command";
export const EX_EVT = "nf.event";
export const COMMANDS = ["emitir","cancelar","inutilizar"] as const;

export async function connectMQ(url: string) {
  const conn = await amqp.connect(url); 
  const ch = await conn.createChannel();
  await declareInfra(ch);
  return { conn, ch };
}

async function declareInfra(ch: amqp.Channel) {
  await ch.assertExchange(EX_CMD, "direct", { durable: true });
  await ch.assertExchange(EX_EVT, "topic",  { durable: true });

  for (const name of COMMANDS) {
    const q = `nf.${name}`;
    const retry = `${q}.retry`;
    const dlq = `${q}.dlq`;

    await ch.assertQueue(q, {
      durable: true,
      deadLetterExchange: EX_CMD,
      deadLetterRoutingKey: `${name}.retry`
    });
    await ch.assertQueue(retry, {
      durable: true,
      messageTtl: 15000,
      deadLetterExchange: EX_CMD,
      deadLetterRoutingKey: name
    });
    await ch.assertQueue(dlq, { durable: true });
    await ch.bindQueue(q, EX_CMD, name);
  }
}

export function publish(
  ch: amqp.Channel,
  ex: string,
  rk: string,
  body: unknown,
  headers: Record<string, any> = {}
) {
  ch.publish(ex, rk, Buffer.from(JSON.stringify(body)), {
    contentType: "application/json",
    persistent: true,
    headers
  });
}
