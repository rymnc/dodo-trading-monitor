import { SinkPayload } from "../types";

/**
 * Interface for the Email Sink Constructor
 */
export interface EmailConstructor {
  /**
   * Email id to sign in as
   */
  email: string;
  /**
   * Password of above email id
   */
  pass: string;
  /**
   * SMTP host URL
   */
  host: string;
  /**
   * Id of the EmailSink
   */
  id: number;
}

/**
 * Interface for the email payload
 */
export interface EmailPayload extends SinkPayload {
  /**
   * Source email address
   */
  from: string;
  /**
   * Destination email address
   */
  to: string;
  /**
   * Subject of the email
   */
  subject: string;
  /**
   * In case of raw string emails, use this field
   */
  text?: string;
  /**
   * In case of formatted emails, use this field
   */
  html?: string;
}
