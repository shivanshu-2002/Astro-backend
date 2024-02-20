const nodeMailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email} successfully`);
  } catch (error) {
    console.error(`Email sending error: ${error.message}`);
    throw error; // You can choose to handle the error as needed
  }
};

module.exports = sendEmail;
