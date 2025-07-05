const nodemailer = require('nodemailer');

module.exports = class Email {
  // Get Needed informaiton from logged in User or The one He singing up
  constructor(user, message) {
    this.to = user.email;
    this.message = message;
    this.firstName = user.name.split(' ')[0];
    this.from = 'osamamansour0110@gmail.com';
  }

  // Abstract The Transporter into Function
  newTransporter() {
    // Using gmail With auth from config
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_NAME,
        pass: process.env.GMAIL_PASS
      }
    });
  }

  // SENDING Email
  async send(subject) {
    // 1) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: this.message
    };

    // 2) Create transporter and send Email
    await this.newTransporter().sendMail(mailOptions);
  }

  // Send Welcome Email For signing up
  async CheckOut() {
    await this.send('Small task from fawry');
  }
};
