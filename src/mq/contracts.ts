export type CommandType = "EMITIR" | "CANCELAR" | "INUTILIZAR";

export type Command<T> = {
  messageId: string;
  correlationId: string;
  type: CommandType;
  payload: T;
  timestamp: string;
  version: number;
};

export type EventType = "NFE_EMITIDA" | "REJEITADA" | "CANCELADA" | "INUTILIZADA";

export type Event<T> = {
  messageId: string;
  correlationId: string;
  event: EventType;
  dados: T;
  timestamp: string;
  version: number;
};
