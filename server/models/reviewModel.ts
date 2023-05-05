import mongoose, { Types } from 'mongoose';
import { reviewType } from '../types/reviewType.ts';

const reviewSchema = new mongoose.Schema<reviewType>(
  {
    review: {
      type: String,
      required: [true, 'Please add a review'],
    },

    rating: {
      type: Number,
      required: [true, 'Please add a review'],
      min: 1,
      max: 5,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre('save', function (next) {
  this.populate({ path: 'tour' });
  this.populate({ path: 'user' });
  next();
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });

  next();
});

export const Review = mongoose.model<reviewType>('Review', reviewSchema);
