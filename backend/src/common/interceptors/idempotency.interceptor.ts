import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    constructor(private cacheService: CacheService) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();

        // Only apply to POST requests
        if (request.method !== 'POST') {
            return next.handle();
        }

        const idempotencyKey = request.headers['x-idempotency-key'];
        if (!idempotencyKey) {
            return next.handle();
        }

        const cacheKey = `idempotency:${idempotencyKey}`;
        const cachedResponse = await this.cacheService.get(cacheKey);

        if (cachedResponse) {
            // If the request is still processing, throw conflict
            if (cachedResponse === 'PROCESSING') {
                throw new ConflictException('A request with this idempotency key is already being processed.');
            }
            // Return cached response
            return of(cachedResponse);
        }

        // Mark as processing
        await this.cacheService.set(cacheKey, 'PROCESSING', 60); // 60 seconds lock

        return next.handle().pipe(
            tap(async (response) => {
                // Cache the final response for 24 hours
                await this.cacheService.set(cacheKey, response, 86400);
            }),
        );
    }
}
