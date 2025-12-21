import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BackgroundJobsService {
    constructor(@InjectQueue('background-tasks') private taskQueue: Queue) { }

    async addCsvImportJob(data: { filePath: string; storeId: string; userId: string }) {
        return this.taskQueue.add('csv-import', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
        });
    }

    async addEmailJob(data: { to: string; subject: string; body: string }) {
        return this.taskQueue.add('send-email', data);
    }

    async addImageCleanupJob(data: { imageUrls: string[] }) {
        return this.taskQueue.add('image-cleanup', data);
    }
}
