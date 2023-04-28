import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 🔥  Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

import app from './app.ts';

dotenv.config({ path: './config.env' });

const server = http.createServer(app);

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

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 🔥  Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
