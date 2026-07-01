import React from "react";

export interface UniversalSendProps {
  toEmail: string | string[];
  subject: string;
  template?: React.ReactElement;
  html?: string;
  text?: string;
}

export interface EmailEngineResponse {
  success: boolean;
  message: string;
  id?: string;
  code?: string;
}

export interface IEmailProvider {
  sendEmail(props: UniversalSendProps): Promise<EmailEngineResponse>;
}
