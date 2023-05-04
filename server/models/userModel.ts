import mongoose from 'mongoose';
import validator from '../helpers/validator.ts';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userType } from '../types/userTypes.ts';

const userSchema = new mongoose.Schema<userType>({
  name: {
    type: String,
    requred: [true, 'User must have a name'],
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'Lead-guide', 'admin'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String || undefined,
    required: [true, 'You must confirm the password'],
  },

  passwordChangedAt: {
    type: Date || undefined,
  },

  passwordResetToken: {
    type: String,
  },

  passwordResetExpires: {
    type: Date,
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//////////////////////////////// VALIDATORS

// VALIDATE PASSWORD (works only on CREATE and SAVE)
userSchema.path('passwordConfirm').validate(function (value: string) {
  if (value !== this.get('password')) {
    throw new Error('Passwords are not the same!');
  }
  return true;
});

//////////////////////////////// MIDDLEWARE

// HASH PASSWORD
userSchema.pre('save', async function (next) {
  // Only run if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

// UPDATE PASSWORD-CHANGED-AT
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  const newDate = Date.now() - 1000;
  this.passwordChangedAt = new Date(newDate);

  next();
});

//////////////////////////////// FILTER OUT INACTIVE USERS

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

////////////////////////////////  METHODS

// PASS VERIFICATION
userSchema.methods.correctPassword = async function (
  canditatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

// CHECK IF USER CHANGED PASSWORD
userSchema.methods.changedPasswordAfter = function (jwtTimestamp: number) {
  const changedPassword = this.get('passwordChangedAt');

  if (changedPassword) {
    const changedTimestamp = Number(changedPassword.getTime() / 1000);

    // if true password was changed after the token was issued
    return changedTimestamp > jwtTimestamp;
  }
};

// GENERATE RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};

const User = mongoose.model<userType>('User', userSchema);

export default User;
