import { createTransport } from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendDeliveryConfirmation(
  email: string,
  deliveryDate: string,
  timeSlot: string
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Meal Box Delivery is Confirmed',
      html: `
        <h1>Delivery Confirmation</h1>
        <p>Your meal box delivery is scheduled for:</p>
        <p><strong>Date:</strong> ${deliveryDate}</p>
        <p><strong>Time:</strong> ${timeSlot}</p>
      `,
    });

    logger.info('Delivery confirmation email sent', { email, deliveryDate, timeSlot });
  } catch (err) {
    logger.error('Failed to send delivery confirmation email:', err);
    throw err;
  }
}

export async function sendSubscriptionConfirmation(email: string, planName: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Meal Box Subscription',
      html: `
        <h1>Welcome to Meal Box!</h1>
        <p>Your subscription to ${planName} has been confirmed.</p>
        <p>You can now start managing your deliveries from your dashboard.</p>
      `,
    });

    logger.info('Subscription confirmation email sent', { email, planName });
  } catch (err) {
    logger.error('Failed to send subscription confirmation email:', err);
    throw err;
  }
}

export const emailService = {
  sendDeliveryConfirmation,
  sendSubscriptionConfirmation,
}; 