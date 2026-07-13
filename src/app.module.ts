import { Module } from '@nestjs/common';
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
  ],
})
export class AppModule {}
