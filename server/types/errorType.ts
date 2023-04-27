export type HttpError = Error & {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
};
