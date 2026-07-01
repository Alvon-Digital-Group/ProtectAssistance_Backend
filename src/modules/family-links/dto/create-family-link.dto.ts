import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionLevel } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateFamilyLinkDto {
  @ApiProperty({
    example: 'family.member@example.com',
    description: 'Email du membre famille à lier au profil protégé',
  })
  @IsEmail()
  familyUserEmail!: string;

  @ApiPropertyOptional({
    example: 'Frère',
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
