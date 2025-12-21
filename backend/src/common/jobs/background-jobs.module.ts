import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BackgroundJobsService } from './background-jobs.service';
import { BackgroundJobsProcessor } from './background-jobs.processor';

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'background-tasks',
        }),
    ],
    providers: [BackgroundJobsService, BackgroundJobsProcessor],
    exports: [BackgroundJobsService],
})
export class BackgroundJobsModule { }
