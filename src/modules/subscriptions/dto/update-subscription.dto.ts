import { ApiProperty } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiProperty({
    enum: PlanType,
    example: PlanType.PREMIUM,
  })
  @IsEnum(PlanType)
  planType!: PlanType;
}
