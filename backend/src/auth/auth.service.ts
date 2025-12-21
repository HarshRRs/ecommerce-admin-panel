import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, RegisterWithStoreDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';
import { Role } from '@prisma/client';

import { EmailService } from '../system/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async forgotPassword(email: string) {
    const user = await this.prisma.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    await this.emailService.sendPasswordReset(user.email, resetToken);

    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.prisma.user.findFirst({
      where: {
        resetToken,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        forcePasswordChange: false,
      },
    });

    return { success: true, message: 'Password reset successfully' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        store: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        storeId: user.storeId,
        storeName: user.store?.name,
        storeStatus: user.store?.status,
        stripeOwnershipConfirmed: user.store?.stripeOwnershipConfirmed,
        forcePasswordChange: user.forcePasswordChange,
      },
    };
  }

  async registerWithStore(dto: RegisterWithStoreDto) {
    // Check if user already exists
    const existingUser = await this.prisma.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if store slug already exists
    const existingStore = await this.prisma.prisma.store.findUnique({
      where: { slug: dto.storeSlug },
    });

    if (existingStore) {
      throw new ConflictException('Store with this slug already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Create store and user in a transaction
    return this.prisma.prisma.$transaction(async (tx) => {
      // 1. Create User first (Owner)
      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: 'OWNER',
        },
      });

      // 2. Create Store with user as owner
      const store = await tx.store.create({
        data: {
          name: dto.storeName,
          slug: dto.storeSlug,
          status: 'ACTIVE',
          ownerId: user.id,
        },
      });

      // 3. Link User back to Store
      await tx.user.update({
        where: { id: user.id },
        data: { storeId: store.id },
      });

      const { accessToken, refreshToken } = await this.generateTokens(user);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          storeId: store.id,
          storeName: store.name,
        },
      };
    });
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: (registerDto.role as Role) || 'STAFF', // Allow setting role
        storeId: registerDto.storeId, // Allow setting storeId
        forcePasswordChange: registerDto.isTemporary || false,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        storeId: user.storeId,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        storeId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.validateUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    // In a production environment, this would invalidate the refresh token in Redis
    // For now, we just return success
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        storeId: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
