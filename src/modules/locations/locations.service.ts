import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertAlertLocationDto } from './dto/upsert-alert-location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAlertWithProtectedProfile(alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: {
        id: alertId,
      },
      include: {
        protectedProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        location: true,
      },
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    return alert;
  }

  private async canViewAlertLocation(userId: string, protectedUserId: string) {
    if (userId === protectedUserId) {
      return true;
    }

    const familyLink = await this.prisma.familyLink.findUnique({
      where: {
        protectedUserId_familyUserId: {
          protectedUserId,
          familyUserId: userId,
        },
      },
    });

    return !!familyLink;
  }

  async getAlertLocation(userId: string, alertId: string) {
    const alert = await this.getAlertWithProtectedProfile(alertId);

    const isAllowed = await this.canViewAlertLocation(
      userId,
      alert.protectedProfile.userId,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à consulter cette localisation',
      );
    }

    if (!alert.location) {
      throw new NotFoundException('Localisation introuvable pour cette alerte');
    }

    return {
      alertId: alert.id,
      alertType: alert.type,
      alertStatus: alert.status,
      protectedUser: alert.protectedProfile.user,
      location: alert.location,
    };
  }

  async upsertAlertLocation(
    userId: string,
    alertId: string,
    upsertAlertLocationDto: UpsertAlertLocationDto,
  ) {
    const alert = await this.getAlertWithProtectedProfile(alertId);

    const isOwner = alert.protectedProfile.userId === userId;

    if (!isOwner) {
      throw new ForbiddenException(
        'Seul l’utilisateur protégé peut modifier la localisation de son alerte',
      );
    }

    const googleMapsUrl =
      upsertAlertLocationDto.googleMapsUrl ??
      `https://www.google.com/maps?q=${upsertAlertLocationDto.latitude},${upsertAlertLocationDto.longitude}`;

    const location = await this.prisma.location.upsert({
      where: {
        alertId,
      },
      update: {
        latitude: upsertAlertLocationDto.latitude,
        longitude: upsertAlertLocationDto.longitude,
        accuracy: upsertAlertLocationDto.accuracy,
        googleMapsUrl,
      },
      create: {
        alertId,
        latitude: upsertAlertLocationDto.latitude,
        longitude: upsertAlertLocationDto.longitude,
        accuracy: upsertAlertLocationDto.accuracy,
        googleMapsUrl,
      },
    });

    return {
      message: 'Localisation mise à jour avec succès',
      alertId: alert.id,
      location,
    };
  }
}
