import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  errorCode?: string;
  timestamp: string;
  path: string;
  details?: any;
}

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public errorCode?: string,
    public details?: any,
  ) {
    super(
      {
        message,
        errorCode,
        details,
      },
      status,
    );
  }
}

export class BusinessLogicException extends BaseException {
  constructor(message: string, errorCode?: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, errorCode, details);
  }
}

export class ValidationException extends BaseException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationException extends BaseException {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, 'AUTHENTICATION_FAILED', details);
  }
}

export class AuthorizationException extends BaseException {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, HttpStatus.FORBIDDEN, 'AUTHORIZATION_FAILED', details);
  }
}

export class NotFoundException extends BaseException {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND');
  }
}

export class ConflictException extends BaseException {
  constructor(message: string, details?: any) {
    super(message, HttpStatus.CONFLICT, 'CONFLICT', details);
  }
}

export class ExternalServiceException extends BaseException {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} failed`,
      HttpStatus.SERVICE_UNAVAILABLE,
      'EXTERNAL_SERVICE_ERROR',
      { service },
    );
  }
}
