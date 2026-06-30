import { PartialType } from '@nestjs/swagger';
import { CreateProtectedProfileDto } from './create-protected-profile.dto';

export class UpdateProtectedProfileDto extends PartialType(
  CreateProtectedProfileDto,
) {}
