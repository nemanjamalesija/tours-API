import { Document } from 'mongoose';

export type userType = Document & {
  name: string;
  email: string;
  photo: string;
  role: string;
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  passwordResetToken: string | undefined;
  passwordResetExpires: Date | undefined;
  active: boolean;
  correctPassword: (
    candidatePassword: string,
    userPassword: string
  ) => Promise<boolean>;

  changedPasswordAfter: (jwtTimestamp: number) => boolean;
  createPasswordResetToken: () => string;
};
