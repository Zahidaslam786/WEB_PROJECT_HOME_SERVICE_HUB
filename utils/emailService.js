const nodemailer = require('nodemailer');

// Create transport configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

// Send verification email
exports.sendVerificationEmail = async (to, url, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Website Team" <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Welcome to our Website!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>If the button doesn't work, please copy and paste the following link in your browser:</p>
          <p><a href="${url}" style="color: #3498db;">${url}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>Website Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (to, url, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Website Team" <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, please copy and paste the following link in your browser:</p>
          <p><a href="${url}" style="color: #3498db;">${url}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Best regards,<br>Website Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send invitation email
exports.sendInvitationEmail = async (to, url, senderName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Home Service Hub" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `${senderName} invites you to Home Service Hub`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Home Service Hub</h1>
          </div>
          <h2 style="color: #333;">You've Been Invited!</h2>
          <p>Hello there,</p>
          <p><strong>${senderName}</strong> thinks you'd love Home Service Hub and has sent you an invitation.</p>
          <p>Join Home Service Hub today to access trusted home services including plumbing, electrical work, cleaning, and more!</p>
          <div style="text-align: center; margin: 30px 0;">
            <p><strong>Special offer:</strong> Sign up with this invitation and get Rs. 300 off your first booking!</p>
            <a href="${url}" style="background-color: #4CAF50; color: white; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: 600; display: inline-block;">Accept Invitation</a>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <h3 style="color: #333; margin-top: 0;">Why Home Service Hub?</h3>
            <ul style="padding-left: 20px; color: #555;">
              <li>Verified professionals you can trust</li>
              <li>Transparent pricing with no hidden fees</li>
              <li>Easy online booking process</li>
              <li>100% service guarantee</li>
            </ul>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
            If you don't want to accept this invitation, simply ignore this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invitation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

// Test the email configuration on startup
testEmailConfig();

module.exports.testEmailConfig = testEmailConfig;
