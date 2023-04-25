import mongoose from 'mongoose';
import { TourType } from '../types/modelsTypes.ts';
import slugify from '../helpers/slugify.ts';

const toursSchema = new mongoose.Schema<TourType>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },

    slug: String,

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

    secretTour: {
      type: Boolean,
      default: false,
    },
  },

  // virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// DOCUMENT MIDDLEWARE
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// toursSchema.pre('save', function (next) {
//   console.log('Will save document now...');
//   next();
// });

// toursSchema.post('save', function (doc, next) {
//   console.log(doc);

//   next();
// });

// QUERY MIDDLEWARE
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(docs);

  next();
});

// VIRTUAL PROPERTIES
toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

export default mongoose.model<TourType>('Tour', toursSchema);
