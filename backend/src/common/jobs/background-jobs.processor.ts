import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../../system/email/email.service';

@Processor('background-tasks')
export class BackgroundJobsProcessor extends WorkerHost {
  private readonly logger = new Logger(BackgroundJobsProcessor.name);

  constructor(private emailService: EmailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'SEND_EMAIL': {
        const { to, subject, html, type, data } = job.data;
        if (type === 'WELCOME') {
          return this.emailService.sendWelcomeEmail(to, data.name);
        } else if (type === 'RESET_PASSWORD') {
          return this.emailService.sendPasswordResetEmail(to, data.token);
        }
        return this.emailService.sendEmail(to, subject, html);
      }

      case 'CSV_IMPORT':
        this.logger.log('Processing CSV import...');
        // Implement CSV processing logic
        break;

      case 'IMAGE_CLEANUP':
        this.logger.log('Processing image cleanup...');
        // Implement cleanup logic
        break;

      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }
}
