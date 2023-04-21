import { app } from './app.ts';
import mongoose from 'mongoose';
import http from 'http';
import dotenv from 'dotenv';

const server = http.createServer(app);
dotenv.config({ path: './config.env' });

const db = process?.env?.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD as string
);

const PORT = process.env.PORT || 6001;

if (!db)
  throw new Error(
    'There has been an error while connecting your password to the database. Could not connect'
  );

mongoose
  .connect(db)
  .then(() => console.log('Database connection is successful'))
  .catch((error) => {
    'There was an error when connecting to the database';
    console.log(error);
  });

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
