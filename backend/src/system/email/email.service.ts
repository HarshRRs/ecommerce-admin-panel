import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('EMAIL_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendEmail(to: string, subject: string, html: string) {
    const from =
      this.configService.get<string>('EMAIL_FROM') || 'OrderNest <noreply@ordernest.com>';

    try {
      const data = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });
      return data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to OrderNest!';
    const html = `
            <h1>Welcome, ${name}!</h1>
            <p>Your e-commerce store is ready. Start adding products and managing orders now.</p>
            <p><a href="${this.configService.get('FRONTEND_URL')}">Go to Dashboard</a></p>
        `;
    return this.sendEmail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const subject = 'Reset Your Password - OrderNest';
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const html = `
            <h1>Password Reset Request</h1>
            <p>You requested to reset your password. Click the link below to set a new one:</p>
            <p><a href="${resetUrl}">Reset Password</a></p>
            <p>If you didn't request this, please ignore this email.</p>
        `;
    return this.sendEmail(to, subject, html);
  }

  async sendPasswordReset(to: string, token: string) {
    return this.sendPasswordResetEmail(to, token);
  }

  async sendOrderConfirmation(to: string, orderId: string, total: number) {
    const subject = `Order Confirmation #${orderId}`;
    const html = `<h1>Thanks for your order!</h1><p>Your order #${orderId} for $${total} is being processed.</p>`;
    return this.sendEmail(to, subject, html);
  }
}
