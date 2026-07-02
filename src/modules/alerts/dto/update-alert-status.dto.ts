import { ApiProperty } from '@nestjs/swagger';
import { AlertStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateAlertStatusDto {
  @ApiProperty({
    enum: AlertStatus,
    example: AlertStatus.ACKNOWLEDGED,
  })
  @IsEnum(AlertStatus)
  status!: AlertStatus;
}