import { userType } from '../types/modelsTypes.ts';
import mongoose from 'mongoose';
import validator from '../helpers/validator.ts';
import bcrypt from 'bcrypt';

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
    type: Date,
  },
});

// validate password (works only on CREATE and SAVE)
userSchema.path('passwordConfirm').validate(function (value: string) {
  if (value !== this.get('password')) {
    throw new Error('Passwords are not the same!');
  }
  return true;
});

userSchema.pre('save', async function (next) {
  // Only run if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
});

// verify password
userSchema.methods.correctPassword = async function (
  canditatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(canditatePassword, userPassword);
};

// check if the user changed the password
userSchema.methods.changedPasswordAfter = function (jwtTimestamp: number) {
  const changedPassword = this.get('passwordChangedAt');

  if (changedPassword) {
    const changedTimestamp = Number(changedPassword.getTime() / 1000);

    // if true password was changed after the token was issued
    return changedTimestamp > jwtTimestamp;
  }
};

const User = mongoose.model<userType>('User', userSchema);

export default User;
