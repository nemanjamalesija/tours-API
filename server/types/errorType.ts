export type HttpError = Error & {
  status?: string;
  statusCode?: number;
};
