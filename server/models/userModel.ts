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

  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User must have a photo'],
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
  this.passwordConfirm = '';
});

const User = mongoose.model<userType>('User', userSchema);

export default User;
