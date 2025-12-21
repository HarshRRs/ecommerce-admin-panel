import { Global, Module } from '@nestjs/common';
import { ImageKitService } from './services/imagekit.service';
import { SecurityService } from './services/security.service';
import { CommonController } from './common.controller';

@Global()
@Module({
  controllers: [CommonController],
  providers: [ImageKitService, SecurityService],
  exports: [ImageKitService, SecurityService],
})
export class CommonModule { }
