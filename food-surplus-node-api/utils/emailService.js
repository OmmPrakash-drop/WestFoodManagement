const nodemailer = require('nodemailer');

// Set up a basic nodemailer transporter
// For local testing, we'll log the email to the console if no real SMTP credentials are provided.
const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: process.env.EMAIL_PORT || 587,
            auth: {
                user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
                pass: process.env.EMAIL_PASS || 'ethereal_password'
            }
        });

        // If credentials are not set in .env, just log it out instead of crashing
        if (!process.env.EMAIL_USER) {
            console.log('\n--- MOCK EMAIL INTERCEPTED ---');
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Message: \n${options.message}`);
            console.log('------------------------------\n');
            return;
        }

        const message = {
            from: `${process.env.FROM_NAME || 'Food Surplus Network'} <${process.env.FROM_EMAIL || 'noreply@foodsurplus.com'}>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
    } catch (err) {
        console.error('Email sending failed:', err);
    }
};

module.exports = sendEmail;
