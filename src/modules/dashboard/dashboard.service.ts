import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly alertInclude = {
    location: true,
    evidence: true,
    notifications: true,
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
  } satisfies Prisma.AlertInclude;

  async getLinkedProtectedProfiles(familyUserId: string) {
    const links = await this.prisma.familyLink.findMany({
      where: {
        familyUserId,
      },
      include: {
        protectedUser: {
          include: {
            protectedProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return links.map((link) => ({
      familyLinkId: link.id,
      relationship: link.relationship,
      permissionLevel: link.permissionLevel,
      protectedUser: {
        id: link.protectedUser.id,
        firstName: link.protectedUser.firstName,
        lastName: link.protectedUser.lastName,
        email: link.protectedUser.email,
        phone: link.protectedUser.phone,
        protectedProfile: link.protectedUser.protectedProfile,
      },
    }));
  }

  async getDashboardAlerts(familyUserId: string) {
    const links = await this.prisma.familyLink.findMany({
      where: {
        familyUserId,
      },
      select: {
        protectedUserId: true,
      },
    });

    const protectedUserIds = links.map((link) => link.protectedUserId);

    if (protectedUserIds.length === 0) {
      return [];
    }

    return this.prisma.alert.findMany({
      where: {
        protectedProfile: {
          userId: {
            in: protectedUserIds,
          },
        },
      },
      include: this.alertInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDashboardAlertById(familyUserId: string, alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: {
        id: alertId,
      },
      include: this.alertInclude,
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    const familyLink = await this.prisma.familyLink.findUnique({
      where: {
        protectedUserId_familyUserId: {
          protectedUserId: alert.protectedProfile.userId,
          familyUserId,
        },
      },
    });

    if (!familyLink) {
      throw new ForbiddenException(
        'Vous n’êtes pas autorisé à consulter cette alerte dans le dashboard',
      );
    }

    return alert;
  }
}
