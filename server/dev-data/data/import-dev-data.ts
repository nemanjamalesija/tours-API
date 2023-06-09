import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Tour from '../../models/tourModel.ts';
import User from '../../models/userModel.ts';
import { Review } from '../../models/reviewModel.ts';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

dotenv.config({ path: `${__dirName}/../../config.env` });

const db = process?.env?.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD as string
);

if (!db)
  throw new Error(
    'There has been an error while connecting your password to the database in the import script. Could not connect'
  );

mongoose
  .connect(db)
  .then(() =>
    console.log('Database connection is successful in the import script')
  )
  .catch((error) => {
    'There was an error when connecting to the database in the import script';
    console.log(error);
  });

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirName}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirName}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirName}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log('Data sucessfully loaded:');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE DATA FROM THE DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data sucessfully deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// RUN FUNCTION DEPENDING ON THE LAST ARG
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
