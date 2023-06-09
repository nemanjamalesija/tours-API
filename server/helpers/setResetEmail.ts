import nodemailer from 'nodemailer';
import catchAsync from './catchAsync.ts';

const sendResetEmail = async (options: any) => {
  // 1. Create a transporter
  var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: 'Nemanja Malesija <hello@malesija.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendResetEmail;
