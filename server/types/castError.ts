export type castErrorDB = {
  stack?: string;
  name?: string;
  message?: string;
  stringValue?: string;
  messageFormat?: string;
  kind?: string;
  value?: string;
  path?: string;
  reason?: string;
  valueType?: string;
  model?: string;
  statusCode?: string | number | undefined;
  status?: string;
  code?: number;
  isOperational?: boolean;
  keyValue?: any;
};
