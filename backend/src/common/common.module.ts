import { Global, Module } from '@nestjs/common';
import { ImageKitService } from './services/imagekit.service';
import { TransactionalEmailService } from './services/email.service';
import { SecurityService } from './services/security.service';
import { CommonController } from './common.controller';

@Global()
@Module({
    controllers: [CommonController],
    providers: [ImageKitService, TransactionalEmailService, SecurityService],
    exports: [ImageKitService, TransactionalEmailService, SecurityService],
})
export class CommonModule { }
