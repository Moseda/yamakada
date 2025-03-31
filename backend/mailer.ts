import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

// Define the mail options
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT), // i use this its also common to use 465
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
      from: '"Mimuco" <mohamed.janati.idrissi@miksim.de>',
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
