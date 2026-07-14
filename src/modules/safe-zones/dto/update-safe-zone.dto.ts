import { PartialType } from '@nestjs/swagger';
import { CreateSafeZoneDto } from './create-safe-zone.dto';

export class UpdateSafeZoneDto extends PartialType(CreateSafeZoneDto) {}
