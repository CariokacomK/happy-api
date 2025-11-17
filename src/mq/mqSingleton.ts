import * as amqp from "amqplib";
import { EX_CMD, publish, connectMQ } from "./rabbit";

let ch: amqp.Channel | null = null;

export async function getChannel() {
  if (ch) return ch;
  const { ch: channel } = await connectMQ(process.env.AMQP_URL!);
  ch = channel;
  return ch;
}

export async function publishCommand(
  rk: "emitir" | "cancelar" | "inutilizar",
  body: unknown
) {
  const channel = await getChannel();
  publish(channel, EX_CMD, rk, body);
}