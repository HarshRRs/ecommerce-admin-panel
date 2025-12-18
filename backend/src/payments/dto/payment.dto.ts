import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  gateway: string;

  @IsString()
  @IsOptional()
  gatewayTransactionId?: string;

  @IsString()
  @IsOptional()
  currency: string;
}

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  gateway: string;

  @IsString()
  @IsOptional()
  token?: string; // For Stripe/PayPal tokens

  @IsString()
  @IsOptional()
  paymentMethodId?: string; // For saved payment methods
}

export class RefundPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
