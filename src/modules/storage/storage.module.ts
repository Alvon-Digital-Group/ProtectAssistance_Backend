import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_SERVICE } from './storage.types';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_SERVICE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const provider =
          configService.get<string>('STORAGE_PROVIDER') ?? 'local';

        if (provider === 'cloudinary') {
          return new CloudinaryStorageService(configService);
        }

        return new LocalStorageService();
      },
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
