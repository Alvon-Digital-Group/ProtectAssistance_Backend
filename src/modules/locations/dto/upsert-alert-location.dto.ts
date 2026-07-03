import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertAlertLocationDto {
  @ApiProperty({ example: 36.8065 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: 10.1815 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({
    example: 'https://www.google.com/maps?q=36.8065,10.1815',
  })
  @IsOptional()
  @IsString()
  googleMapsUrl?: string;
}
