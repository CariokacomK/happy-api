import * as amqp from "amqplib";
import { connectMQ, EX_EVT, publish } from "./rabbit";
import { randomUUID } from "crypto";
import { attempts, retryable, nackToRetry, rejectToDlq } from "./workerShared";
import notaFiscalService from "../services/NotaFiscalService";
import { TipoId } from "../models/enum/TipoId";

export async function startCancelarWorker() {
  const { ch } = await connectMQ(process.env.AMQP_URL!);
  ch.prefetch(10);

  await ch.consume("nf.cancelar", async (msg: amqp.ConsumeMessage | null) => {
    if (!msg) return;
    const start = Date.now();
    const cmd = JSON.parse(msg.content.toString()) as {
      correlationId: string;
      payload: { notaId: string; empresaId: string; tipoId: TipoId };
    };

    try {
      await notaFiscalService.cancelarNota(cmd.payload.empresaId, cmd.payload.notaId, cmd.payload.tipoId);

      publish(ch, EX_EVT, "nfe.cancelada", {
        messageId: randomUUID(),
        correlationId: cmd.correlationId,
        event: "CANCELADA",
        dados: { notaId: cmd.payload.notaId },
        timestamp: new Date().toISOString(),
        version: 1
      });

      ch.ack(msg);
    } catch (e: any) {
      if (retryable(e) && attempts(msg) < 5) return nackToRetry(ch, msg);
      return rejectToDlq(ch, msg);
    } finally {
      console.log(JSON.stringify({ t: "cancelar", corr: cmd.correlationId, ms: Date.now() - start }));
    }
  }, { noAck: false });

  console.log("[worker] cancelar pronto");
}