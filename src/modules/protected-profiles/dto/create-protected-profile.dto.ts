import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateProtectedProfileDto {
  @ApiPropertyOptional({ example: '1998-05-12' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Tunis, Tunisia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Contacter la famille en cas d’urgence.',
  })
  @IsOptional()
  @IsString()
  emergencyNote?: string;

  @ApiPropertyOptional({
    example: 'Allergie à la pénicilline.',
  })
  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
