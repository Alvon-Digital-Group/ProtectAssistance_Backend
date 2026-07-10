import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebasePushService } from './firebase-push.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebasePushService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
