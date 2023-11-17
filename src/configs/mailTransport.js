const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const SendMail = (msg) => {
  transporter.sendMail(msg, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = {
  SenderMailServer: () => {
    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Server is ready to take our messages');
      }
    });
  },

  sendMailForgotPassword: (email, code) => {
    const msg = {
      to: email,
      from: {
        name: 'DevHub',
        address: 'support@devhub.com'
      },
      subject: 'Reset your DevHub password',
      html: `
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center;">
              <img src="https://i.imgur.com/KcGts4j.png" alt="DevHub Logo" style="max-width: 150px; margin-bottom: 20px;">
              <h1 style="font-size: 24px; font-weight: bold; color: #333;">Hello!</h1>
              <p style="font-size: 16px; color: #555;">
                We received a request to reset the password for your DevHub account. Please use the code below to reset your password:
              </p>
              <div style="background: #007bff; color: #fff; padding: 12px 24px; display: inline-block; font-size: 18px; border-radius: 5px; margin-top: 20px;">
                <b>${code}</b>
              </div>
              <p style="font-size: 16px; color: #555; margin-top: 20px;">
                If you didn't request a password reset, please ignore this email.
              </p>
              <p style="font-size: 16px; color: #555;">
                For assistance, contact our support team at <a href="mailto:support@devhub.com" style="color: #007bff; text-decoration: none;">support@devhub.com</a>.
              </p>
              <p style="font-size: 16px; color: #555;">
                Sincerely,<br/>
                The DevHub Team
              </p>
            </td>
          </tr>
        </table>
      `
    };
    return SendMail(msg);
  }
};
