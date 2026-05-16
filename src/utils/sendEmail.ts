// // utils/sendEmail.ts
// import nodemailer from 'nodemailer';

// interface EmailOptions {
//     to: string;
//     subject: string;
//     html: string;
// }

// export const sendEmail = async (options: EmailOptions) => {
//     const transporter = nodemailer.createTransport({
//         host: process.env.SMTP_HOST,   // e.g. "smtp.gmail.com"
//         port: 587,                     // 465 for secure, 587 for TLS
//         secure: false,                 // true for port 465, false for 58
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_FROM,
//         to: options.to,
//         subject: options.subject,
//         html: options.html,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//     } catch (err) {
//         console.error("Email send failed:", err);
//         throw new Error("Email could not be sent");
//     }
// };



import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER, // e.g. support@yourdomain.com
      pass: process.env.EMAIL_PASS, // mailbox password
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    await transporter.verify();
    console.log(" Email sent successfully");
  } catch (err) {
    console.error(" Email send failed:", err);
    return false;
  }
};
