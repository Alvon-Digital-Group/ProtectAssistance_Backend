import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertType, Severity } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateAlertLocationDto } from './create-alert-location.dto';

export class CreateAlertDto {
  @ApiProperty({
    enum: AlertType,
    example: AlertType.PANIC_BUTTON,
  })
  @IsEnum(AlertType)
  type!: AlertType;

  @ApiPropertyOptional({
    enum: Severity,
    example: Severity.CRITICAL,
  })
  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @ApiPropertyOptional({
    example: 'Alerte déclenchée depuis le bouton panique.',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    type: CreateAlertLocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAlertLocationDto)
  location?: CreateAlertLocationDto;
}
