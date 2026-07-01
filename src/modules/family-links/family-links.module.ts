import { Module } from '@nestjs/common';
import { FamilyLinksController } from './family-links.controller';
import { FamilyLinksService } from './family-links.service';

@Module({
  controllers: [FamilyLinksController],
  providers: [FamilyLinksService],
  exports: [FamilyLinksService],
})
export class FamilyLinksModule {}
