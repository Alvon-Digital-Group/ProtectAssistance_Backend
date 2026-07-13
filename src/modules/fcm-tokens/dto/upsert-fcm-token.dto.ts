import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpsertFcmTokenDto {
  @ApiProperty({
    example: 'fcm-token-from-mobile-app',
  })
  @IsString()
  token!: string;

  @ApiPropertyOptional({
    example: 'android',
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    example: 'device-123',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;
}
