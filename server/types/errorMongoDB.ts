export type errorMongoDB = {
  stack?: string;
  name?: string;
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
  isOperational?: boolean;
};
