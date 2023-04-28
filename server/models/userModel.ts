import { userType } from '../types/modelsTypes.ts';
import mongoose from 'mongoose';
import validator from '../helpers/validator.ts';

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

// validate password (works only on create and save)
userSchema.path('passwordConfirm').validate(function (value: string) {
  if (value !== this.get('password')) {
    throw new Error('Passwords are not the same!');
  }
  return true;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
});

const User = mongoose.model<userType>('User', userSchema);

export default User;
