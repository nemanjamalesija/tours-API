import mongoose, { Types } from 'mongoose';
import { reviewType } from '../types/reviewType.ts';
import Tour from './tourModel.ts';

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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this points to the model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },

    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRatings,
    ratingsAverage: stats[0].averageRating,
  });
};

reviewSchema.post('save', function () {
  // @ts-ignore: typescript doesn't recognise the type
  this.constructor.calcAverageRatings(this.tour); // this points to review object
});

export const Review = mongoose.model<reviewType>('Review', reviewSchema);
