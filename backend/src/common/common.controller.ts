import { Controller, Get } from '@nestjs/common';
import { ImageKitService } from './services/imagekit.service';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('common')
export class CommonController {
    constructor(private readonly imagekitService: ImageKitService) { }

    @Get('imagekit-auth')
    @Roles(Role.SUPER_ADMIN, Role.OWNER, Role.MANAGER, Role.STAFF)
    getImageKitAuth() {
        return this.imagekitService.getAuthenticationParameters();
    }
}
