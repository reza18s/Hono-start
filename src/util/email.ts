const nodemailer = require("nodemailer");

const sendEmail = async (options: {
   email: string;
   subject: string;
   message: string;
}) => {
   // 1) Create a transporter
   const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASSWORD,
      },
   });
   console.log(transporter);

   // 2) Define the email options
   const mailOptions = {
      from: "Jonas Schmedtmann <swary2021@gmail.com>",
      to: options.email,
      subject: options.subject,
      text: options.message,
      // html:
   };

   // 3) Actually send the email
   await transporter.sendMail(mailOptions);
};
export default sendEmail;
