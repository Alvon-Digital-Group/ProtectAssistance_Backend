import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateSafeZoneDto {
  @ApiProperty({ example: 'Maison' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 36.8065 })
  @Min(-90)
  @Max(90)
  centerLatitude!: number;

  @ApiProperty({ example: 10.1815 })
  @Min(-180)
  @Max(180)
  centerLongitude!: number;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(10)
  radiusMeters!: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
