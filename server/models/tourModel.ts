import mongoose, { Types } from 'mongoose';
import { TourType } from '../types/tourTypes.ts';
import slugify from '../helpers/slugify.ts';

const toursSchema = new mongoose.Schema<TourType>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 character'],
      minlength: [10, 'A tour name must have more or equal then 10 character'],
    },

    slug: {
      type: String,
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be higher than 1.0'],
      max: [5, 'Rating must be lower than 5.0'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'The difficulties must either be: easy, medium or difficult',
      },
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
    startLocation: {
      // geoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      adress: String,
      description: String,
    },
    locations: [
      {
        // geoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
      },
    ],
    guides: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  // virtual properties
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// SET INDEXES
toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });
toursSchema.index({ startLocation: '2dsphere' });

// DOCUMENT MIDDLEWARE
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

// QUERY MIDDLEWARE
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

// AGGREGATION MIDDLEWARE
// toursSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   next();
// });

// VIRTUAL PROPERTIES
toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
toursSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// CUSTOM VALIDATORS
toursSchema.path('priceDiscount').validate(function (value: number) {
  if (value >= this.get('price')) {
    throw new Error(
      `Price discount: ${value} must be less than price: ${this.get('price')}`
    );
  }
  return true;
});

toursSchema.pre('save', async function (next) {
  // Only run if password was actually modified
  if (!this.isModified('rating')) return next();

  console.log(this.ratingsAverage);

  // Hash the password with the cost of 12
});

const Tour = mongoose.model<TourType>('Tour', toursSchema);

export default Tour;
