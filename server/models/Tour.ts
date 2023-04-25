import mongoose from 'mongoose';
import { TourType } from '../types/modelsTypes.ts';
import sligufy from 'slugify';

const toursSchema = new mongoose.Schema<TourType>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: Number,

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },

    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },

    descrption: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },

  // virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

toursSchema.pre('save', function () {
  console.log(this);
});

toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

export default mongoose.model<TourType>('Tour', toursSchema);
