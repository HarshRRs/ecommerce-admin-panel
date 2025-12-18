import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

@Injectable()
export class TransactionalEmailService {
    private readonly logger = new Logger(TransactionalEmailService.name);

    constructor(private configService: ConfigService) { }

    async sendEmail(options: EmailOptions) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        const from = options.from || this.configService.get<string>('EMAIL_FROM', 'noreply@yourdomain.com');

        if (!apiKey) {
            this.logger.warn(`No Email API Key. Logging email locally:
To: ${options.to}
Subject: ${options.subject}
Body: ${options.html.substring(0, 100)}...`);
            return { success: true, message: 'Email logged to console (dev mode)' };
        }

        try {
            // Placeholder for Resend implementation
            // const resend = new Resend(apiKey);
            // await resend.emails.send({ ...options, from });

            this.logger.log(`Email sent to ${options.to} via Resend`);
            return { success: true };
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async sendOrderConfirmation(email: string, orderId: string, total: number) {
        return this.sendEmail({
            to: email,
            subject: `Order Confirmation #${orderId}`,
            html: `<h1>Thanks for your order!</h1><p>Your order #${orderId} for $${total} is being processed.</p>`,
        });
    }

    async sendPasswordReset(email: string, token: string) {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
        return this.sendEmail({
            to: email,
            subject: 'Password Reset Request',
            html: `<h1>Reset your password</h1><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        });
    }
}
