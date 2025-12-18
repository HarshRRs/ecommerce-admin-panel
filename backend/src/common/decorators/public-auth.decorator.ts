import { SetMetadata } from '@nestjs/common';

export const IsPublicAuth = () => SetMetadata('isPublicAuth', true);
