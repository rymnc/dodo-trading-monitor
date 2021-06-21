import { SinkPayload } from "../types";

/**
 * Interface for the Email Sink Constructor
 */
export interface EmailConstructor {
  email: string;
  pass: string;
  host: string;
  id: number;
}

/**
 * Interface for the email payload
 */
export interface EmailPayload extends SinkPayload {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
