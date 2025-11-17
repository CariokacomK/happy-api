import axios from "axios";

const baseURL = process.env.ENOTAS_BASE_URL ?? "https://api.enotasgw.com.br/";
const apiKey = process.env.ENOTAS_API_KEY;

export const enotasApi = axios.create({
  baseURL,
  headers: {
    Authorization: `Basic ${apiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});