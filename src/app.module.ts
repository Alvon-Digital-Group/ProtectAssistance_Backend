import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProtectedProfilesModule } from './modules/protected-profiles/protected-profiles.module';
import { FamilyLinksModule } from './modules/family-links/family-links.module';
import { EmergencyContactsModule } from './modules/emergency-contacts/emergency-contacts.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { LocationsModule } from './modules/locations/locations.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FcmTokensModule } from './modules/fcm-tokens/fcm-tokens.module';
import { SafeZonesModule } from './modules/safe-zones/safe-zones.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
    }),
    HealthModule,
    DatabaseModule,
    AuthModule,
    ProtectedProfilesModule,
    FamilyLinksModule,
    EmergencyContactsModule,
    AlertsModule,
    LocationsModule,
    EvidenceModule,
    NotificationsModule,
    FcmTokensModule,
    SafeZonesModule,
    SubscriptionsModule,
    DashboardModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
