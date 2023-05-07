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
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // @ts-ignore: typescript doesn't recognise that this is current review now
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.post(/^findOneAnd/, async (doc) => {
  if (doc) await doc.constructor.calcAverageRatings(doc.tour);
});

export const Review = mongoose.model<reviewType>('Review', reviewSchema);
