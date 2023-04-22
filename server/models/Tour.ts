import mongoose from 'mongoose';

const toursSchema = new mongoose.Schema({
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

  diffuculty: {
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
    trime: true,
  },

  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },

  images: [String],

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  startDates: [Date], 
});

const Tour = mongoose.model('Tour', toursSchema);

export default Tour;
