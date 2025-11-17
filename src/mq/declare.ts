import "dotenv/config";
import { connectMQ } from "./rabbit";

(async () => {
  const url = process.env.AMQP_URL!;
  const { conn, ch } = await connectMQ(url);
  console.log("RabbitMQ ok: exchanges e filas declaradas.");
  await ch.close();
  await conn.close();
})();