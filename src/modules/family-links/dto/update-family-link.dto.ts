import { ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFamilyLinkDto {
  @ApiPropertyOptional({
    example: 'Parent',
    description: 'Relation avec l’utilisateur protégé',
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({
    enum: PermissionLevel,
    example: PermissionLevel.RECEIVE_ALERTS,
  })
  @IsOptional()
  @IsEnum(PermissionLevel)
  permissionLevel?: PermissionLevel;
}
