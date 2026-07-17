import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAlerts() {
    return this.prisma.alert.findMany({
      include: {
        location: true,
        evidence: true,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStats() {
    const [
      usersCount,
      protectedProfilesCount,
      alertsCount,
      activeAlertsCount,
      evidenceCount,
      familyLinksCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.protectedProfile.count(),
      this.prisma.alert.count(),
      this.prisma.alert.count({
        where: {
          status: {
            notIn: ['RESOLVED', 'FALSE_ALARM'],
          },
        },
      }),
      this.prisma.evidence.count(),
      this.prisma.familyLink.count(),
    ]);

    return {
      usersCount,
      protectedProfilesCount,
      alertsCount,
      activeAlertsCount,
      evidenceCount,
      familyLinksCount,
    };
  }
}
