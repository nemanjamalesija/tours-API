export type castErrorDB = Error & {
  stringValue: string;
  valueType: string;
  kind: string;
  value: string;
  path: string;
  reason: any;
  name: string;
  message: string;
  isOperational?: boolean;
};
