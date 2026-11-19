import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export const ORDER_TYPES = ['B2C', 'B2B'] as const;

export class CreateOrderDto {
  @ApiPropertyOptional({
    description: 'Order id, e.g. "PVT-10231". If omitted, the server generates one automatically.',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: ORDER_TYPES })
  @IsIn(ORDER_TYPES as unknown as string[])
  type: string;

  @ApiProperty()
  @IsString()
  customer: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Defaults to "PO Received" for B2B, "Pending" for B2C' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Display date string, e.g. "2 Aug 2026". Defaults to today if omitted.' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    type: [Object],
    description:
      'Snapshot of what was ordered: [{ productId, product, qty, price }]. Stored as-is so vendor/customer can see it later even if the product listing changes. productId is used to decrement stock at order-creation time.',
  })
  @IsOptional()
  @IsArray()
  items?: { productId?: string; product: string; qty: number; price: number; variantId?: string }[];

  @ApiPropertyOptional({
    type: Object,
    description: 'Full delivery address snapshot at checkout time, e.g. { fullName, phone, line1, line2, landmark, city, state, pincode }',
  })
  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @ApiPropertyOptional({ description: 'e.g. "Cash on Delivery"' })
  @IsOptional()
  @IsString()
  payment?: string;

  @ApiPropertyOptional({
    description: 'Customer\'s user id — persisted on the order so "My Orders"/Returns can match on a stable id instead of the mutable customer name. Also used to clear that user\'s cart once the order is created.',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Coupon code applied at checkout, if any.' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Vendor id this sub-order belongs to — persisted so the vendor dashboard can match on a stable id instead of the mutable store name.',
  })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional({ description: 'Set by the vendor when confirming the order (e.g. "12 Aug 2026")' })
  @IsOptional()
  @IsString()
  deliveryDate?: string;

  @ApiPropertyOptional({
    description:
      'Order Placed -> Confirmed by Vendor -> Packed -> Shipped -> Out for Delivery -> Delivered (or Cancelled). Defaults to "Order Placed".',
  })
  @IsOptional()
  @IsString()
  trackingStatus?: string;
}
