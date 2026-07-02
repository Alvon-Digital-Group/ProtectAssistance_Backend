import { Injectable, NotFoundException } from '@nestjs/common';
import { Severity } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProtectedProfileByUserId(userId: string) {
    const protectedProfile = await this.prisma.protectedProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!protectedProfile) {
      throw new NotFoundException(
        'Profil protégé introuvable. Veuillez créer un profil protégé avant de créer une alerte.',
      );
    }

    return protectedProfile;
  }

  async createAlert(userId: string, createAlertDto: CreateAlertDto) {
    const protectedProfile = await this.getProtectedProfileByUserId(userId);

    const location = createAlertDto.location;

    return this.prisma.alert.create({
      data: {
        protectedProfileId: protectedProfile.id,
        type: createAlertDto.type,
        severity: createAlertDto.severity ?? Severity.MEDIUM,
        message: createAlertDto.message,
        location: location
          ? {
              create: {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
                googleMapsUrl:
                  location.googleMapsUrl ??
                  `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
              },
            }
          : undefined,
      },
      include: {
        location: true,
      },
    });
  }
}
