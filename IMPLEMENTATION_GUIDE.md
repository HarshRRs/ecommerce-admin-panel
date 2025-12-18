# Implementation Guide for Remaining Modules

This guide helps you continue building the Universal E-commerce Admin Panel by implementing the remaining modules.

## 📋 What's Been Completed

✅ **Foundation (COMPLETE)**
- Project structure with backend and frontend directories
- NestJS backend initialization with TypeScript
- Prisma ORM setup with comprehensive database schema (15+ models)
- Docker configuration (PostgreSQL, Redis, Backend)
- Common utilities (decorators, guards, interceptors structure)
- Seed data with demo store and sample products
- Documentation (README, QUICKSTART)

✅ **Modules (Partially Complete)**
- Authentication module structure (needs JWT implementation)
- Prisma service (database client)

## 🚧 What Needs to Be Implemented

### Backend Modules (Priority Order)

#### 1. **Authentication Module** (CRITICAL - Start Here)

**Location:** `backend/src/auth/`

**Files to Create/Update:**

`jwt.strategy.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      storeId: payload.storeId,
    };
  }
}
```

`auth.service.ts`:
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      },
    });

    return this.login({ email: user.email, password: registerDto.password });
  }
}
```

`auth.controller.ts`:
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
}
```

**Guards to Create:**

`backend/src/common/guards/jwt-auth.guard.ts`:
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}
```

`backend/src/common/guards/roles.guard.ts`:
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Update auth.module.ts:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

**Update app.module.ts to add global guards:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

#### 2. **Store Management Module**

**Generate module:**
```bash
nest g module stores
nest g service stores
nest g controller stores
```

**Implementation Pattern:**
- Create DTOs for create/update store
- Implement CRUD operations in service
- Add multi-tenant middleware to inject storeId
- Ensure Super Admin can access all stores

#### 3. **Product Management Module**

**Generate module:**
```bash
nest g module products
nest g service products
nest g controller products
```

**Key Features to Implement:**
- CRUD for products
- Variant management
- Category assignment
- Bulk import/export (CSV)
- Stock management
- Image upload (integrate with S3)

#### 4. **Order Management Module**

**Generate:**
```bash
nest g module orders
nest g service orders
nest g controller orders
```

**Implementation:**
- Order creation and status workflow
- Order items calculation
- Invoice generation (PDF)
- Refund processing
- Order notes

#### 5. **Customer Management Module**

**Generate:**
```bash
nest g module customers
nest g service customers
nest g controller customers
```

**Features:**
- Customer CRUD
- Address management
- Order history
- Customer segmentation

#### 6-11. **Other Modules** (Follow Same Pattern)

- Payments (`payments/`)
- Shipping (`shipping/`)
- Coupons (`coupons/`)
- Analytics (`analytics/`)
- CMS (`cms/`)
- System Admin (`system/`)

### Frontend Implementation

#### 1. **Initialize React Frontend**

```bash
cd admin-panel
npm create vite@latest . -- --template react-ts
npm install
```

#### 2. **Install Dependencies**

```bash
npm install react-router-dom @tanstack/react-query axios
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-icons class-variance-authority clsx tailwind-merge
```

#### 3. **Setup Tailwind CSS**

```bash
npx tailwindcss init -p
```

#### 4. **Install ShadCN UI**

```bash
npx shadcn-ui@latest init
```

#### 5. **Project Structure**

Create the following structure:
```
admin-panel/src/
├── components/
│   ├── ui/              # ShadCN components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── modules/
│       ├── ProductForm.tsx
│       ├── OrderTable.tsx
│       └── CustomerCard.tsx
├── pages/
│   ├── auth/
│   │   └── Login.tsx
│   ├── dashboard/
│   │   └── Dashboard.tsx
│   ├── products/
│   ├── orders/
│   └── customers/
├── hooks/
│   ├── useAuth.ts
│   └── useApi.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

#### 6. **Create API Service**

`services/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### 7. **Authentication Context**

`hooks/useAuth.ts`:
```typescript
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', response.data.access_token);
    setUser(response.data.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

## 🎯 Development Checklist

### For Each Module:

- [ ] Create DTOs for request validation
- [ ] Implement service with business logic
- [ ] Create controller with REST endpoints
- [ ] Add proper error handling
- [ ] Write unit tests
- [ ] Add API documentation comments
- [ ] Test with Postman/cURL
- [ ] Update README with endpoints

### Best Practices:

1. **Use DTOs** - Always validate input with class-validator
2. **Error Handling** - Use NestJS built-in exception filters
3. **Logging** - Add logging for important operations
4. **Testing** - Write tests for critical business logic
5. **Documentation** - Document all API endpoints
6. **Security** - Always check authentication and authorization
7. **Performance** - Use caching where appropriate (Redis)

## 📚 Resources

- [NestJS Best Practices](https://docs.nestjs.com/techniques/database)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [React Query Guide](https://tanstack.com/query/latest/docs/react/overview)
- [ShadCN UI Components](https://ui.shadcn.com/docs/components)

## 🐛 Common Issues

**Issue:** Prisma Client not found
**Solution:** Run `npm run prisma:generate`

**Issue:** Database migration error
**Solution:** Reset database with `npm run prisma:migrate reset`

**Issue:** JWT verification fails
**Solution:** Check JWT_SECRET in .env matches between environments

---

**Start with Authentication, then build out the other modules following these patterns!**
