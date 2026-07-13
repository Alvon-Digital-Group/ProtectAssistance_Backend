import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertFcmTokenDto } from './dto/upsert-fcm-token.dto';

@Injectable()
export class FcmTokensService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMyFcmToken(userId: string, dto: UpsertFcmTokenDto) {
    return this.prisma.fcmToken.upsert({
      where: {
        token: dto.token,
      },
      update: {
        userId,
        platform: dto.platform,
        deviceId: dto.deviceId,
        isActive: true,
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
        deviceId: dto.deviceId,
        isActive: true,
      },
    });
  }
}
