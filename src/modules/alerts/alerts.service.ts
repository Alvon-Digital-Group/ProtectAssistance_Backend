import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AlertStatus, Prisma, Severity } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { GetAlertsQueryDto } from './dto/get-alerts-query.dto';
import { UpdateAlertStatusDto } from './dto/update-alert-status.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly alertInclude = {
    location: true,
    evidence: true,
    notifications: true,
    protectedProfile: {
      select: {
        id: true,
        userId: true,
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
  } satisfies Prisma.AlertInclude;

  private async getProtectedProfileByUserId(userId: string) {
    const protectedProfile = await this.prisma.protectedProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!protectedProfile) {
      throw new NotFoundException(
        'Profil protégé introuvable. Veuillez créer un profil protégé avant de créer ou consulter une alerte.',
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

  async getMyAlerts(userId: string, query: GetAlertsQueryDto) {
    const protectedProfile = await this.getProtectedProfileByUserId(userId);

    const where: Prisma.AlertWhereInput = {
      protectedProfileId: protectedProfile.id,
      status: query.status,
      type: query.type,
      severity: query.severity,
    };

    return this.prisma.alert.findMany({
      where,
      include: this.alertInclude,
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit ?? 50,
    });
  }

  async getFamilyAlerts(userId: string, query: GetAlertsQueryDto) {
    const familyLinks = await this.prisma.familyLink.findMany({
      where: {
        familyUserId: userId,
      },
      select: {
        protectedUserId: true,
      },
    });

    const protectedUserIds = familyLinks.map((link) => link.protectedUserId);

    if (protectedUserIds.length === 0) {
      return [];
    }

    const where: Prisma.AlertWhereInput = {
      protectedProfile: {
        userId: {
          in: protectedUserIds,
        },
      },
      status: query.status,
      type: query.type,
      severity: query.severity,
    };

    return this.prisma.alert.findMany({
      where,
      include: this.alertInclude,
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit ?? 50,
    });
  }

  async getAlertById(userId: string, alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: {
        id: alertId,
      },
      include: this.alertInclude,
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    const isOwner = alert.protectedProfile.userId === userId;

    const familyLink = await this.prisma.familyLink.findUnique({
      where: {
        protectedUserId_familyUserId: {
          protectedUserId: alert.protectedProfile.userId,
          familyUserId: userId,
        },
      },
    });

    const isLinkedFamilyMember = !!familyLink;

    if (!isOwner && !isLinkedFamilyMember) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à consulter cette alerte',
      );
    }

    return alert;
  }
  async updateAlertStatus(
    userId: string,
    alertId: string,
    updateAlertStatusDto: UpdateAlertStatusDto,
  ) {
    const alert = await this.prisma.alert.findUnique({
      where: {
        id: alertId,
      },
      include: {
        protectedProfile: true,
      },
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    const isOwner = alert.protectedProfile.userId === userId;

    const familyLink = await this.prisma.familyLink.findUnique({
      where: {
        protectedUserId_familyUserId: {
          protectedUserId: alert.protectedProfile.userId,
          familyUserId: userId,
        },
      },
    });

    const isLinkedFamilyMember = !!familyLink;

    if (!isOwner && !isLinkedFamilyMember) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à modifier cette alerte',
      );
    }

    const shouldSetResolvedAt =
      updateAlertStatusDto.status === AlertStatus.RESOLVED ||
      updateAlertStatusDto.status === AlertStatus.FALSE_ALARM;

    return this.prisma.alert.update({
      where: {
        id: alertId,
      },
      data: {
        status: updateAlertStatusDto.status,
        resolvedAt: shouldSetResolvedAt ? new Date() : null,
      },
      include: this.alertInclude,
    });
  }
}
