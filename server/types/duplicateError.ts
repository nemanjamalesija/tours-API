export type duplicateErrorDB = Error & {
  index: number;
  code: number;
  keyPattern: {
    name: number;
  };
  keyValue: {
    name: string;
  };
  statusCode: number;
  status: string;
  isOperational?: boolean;
};
