import * as amqp from "amqplib";
import { connectMQ, EX_EVT, publish } from "./rabbit";
import { randomUUID } from "crypto";
import { attempts, retryable, nackToRetry, rejectToDlq } from "./workerShared";
import notaFiscalService from "../services/NotaFiscalService";

export async function startInutilizarWorker() {
  const { ch } = await connectMQ(process.env.AMQP_URL!);
  ch.prefetch(10);

  await ch.consume("nf.inutilizar", async (msg: amqp.ConsumeMessage | null) => {
    if (!msg) return;
    const start = Date.now();
    const cmd = JSON.parse(msg.content.toString());

    try {
      await notaFiscalService.inutilizarNota(cmd.payload);

      publish(ch, EX_EVT, "nfe.inutilizada", {
        messageId: randomUUID(),
        correlationId: cmd.correlationId,
        event: "INUTILIZADA",
        dados: { id: cmd.payload?.id },
        timestamp: new Date().toISOString(),
        version: 1
      });

      ch.ack(msg);
    } catch (e: any) {
      if (retryable(e) && attempts(msg) < 5) return nackToRetry(ch, msg);
      return rejectToDlq(ch, msg);
    } finally {
      console.log(JSON.stringify({ t: "inutilizar", corr: cmd.correlationId, ms: Date.now() - start }));
    }
  }, { noAck: false });

  console.log("[worker] inutilizar pronto");
}