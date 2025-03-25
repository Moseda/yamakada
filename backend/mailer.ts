import * as nodemailer from "nodemailer";
import * as dotenv from 'dotenv';

// Define the mail options
const transporter = nodemailer.createTransport({
  host: "secure.emailsrvr.com", // 
  port: 587, // i use this its also common to use 465
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "mohamed.janati.idrissi@miksim.de", 
    pass: "cnR6Fm4AbmRpAWKBiDDP#", 
},
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
) => {
  try {
    const info = await transporter.sendMail({
      from: '"Simo" <mohamed.janati.idrissi@miksim.de>',
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

export default sendEmail;