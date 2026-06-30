import { Module } from '@nestjs/common';
import { ProtectedProfilesController } from './protected-profiles.controller';
import { ProtectedProfilesService } from './protected-profiles.service';

@Module({
  controllers: [ProtectedProfilesController],
  providers: [ProtectedProfilesService],
  exports: [ProtectedProfilesService],
})
export class ProtectedProfilesModule {}
