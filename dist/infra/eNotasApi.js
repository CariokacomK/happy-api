"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enotasApi = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.ENOTAS_BASE_URL ?? "https://api.enotasgw.com.br/";
const apiKey = process.env.ENOTAS_API_KEY ?? "NzEwMDg5NGYtYmE2Zi00ODM1LTkyMzktNmVlMTY2NmQwNzAw";
exports.enotasApi = axios_1.default.create({
    baseURL,
    headers: {
        Authorization: `Basic ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    timeout: 10000,
});
//# sourceMappingURL=eNotasApi.js.map