import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

@Injectable()
export class SecurityService {
    private readonly logger = new Logger(SecurityService.name);
    private readonly algorithm = 'aes-256-gcm';
    private readonly key: Buffer;

    constructor(private configService: ConfigService) {
        const masterKey = this.configService.get<string>('ENCRYPTION_KEY');
        if (!masterKey) {
            this.logger.error('ENCRYPTION_KEY is missing! Using a fallback for development ONLY. PRODUCTION WILL BE INSECURE.');
            this.key = scryptSync('fallback-dev-key', 'salt', 32);
        } else {
            this.key = scryptSync(masterKey, 'ecommerce-safe-salt', 32);
        }
    }

    encrypt(text: string): string {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, this.key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const tag = cipher.getAuthTag().toString('hex');

        return `${iv.toString('hex')}:${tag}:${encrypted}`;
    }

    decrypt(hash: string): string {
        const [ivHex, tagHex, encryptedText] = hash.split(':');

        if (!ivHex || !tagHex || !encryptedText) {
            throw new Error('Invalid encryption hash format');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const decipher = createDecipheriv(this.algorithm, this.key, iv);

        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}
