import { ApiPropertyOptional } from '@nestjs/swagger';
import { AlertStatus, AlertType, Severity } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetAlertsQueryDto {
  @ApiPropertyOptional({
    enum: AlertStatus,
    example: AlertStatus.CREATED,
  })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiPropertyOptional({
    enum: AlertType,
    example: AlertType.PANIC_BUTTON,
  })
  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;

  @ApiPropertyOptional({
    enum: Severity,
    example: Severity.CRITICAL,
  })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({
    example: 20,
    description: 'Nombre maximum d’alertes à retourner',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}