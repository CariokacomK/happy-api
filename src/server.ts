import express from "express";
import notaFiscalRoutes from "./routes/NotaFiscalRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8087;

app.use(express.json());

app.use("/notas", notaFiscalRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
