import "dotenv/config";
import { startEmitirWorker } from "./emitirWorker";
import { startCancelarWorker } from "./cancelarWorker";
import { startInutilizarWorker } from "./inutilizarWorker";

export async function startWorkers() {
  await Promise.all([
    startEmitirWorker(),
    startCancelarWorker(),
    startInutilizarWorker()
  ]);
}

startWorkers();