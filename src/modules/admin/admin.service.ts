import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getUserDashboardById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        protectedProfile: {
          include: {
            alerts: {
              include: {
                location: true,
                evidence: true,
                notifications: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
        notifications: {
          include: {
            alert: {
              include: {
                location: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        familyLinksAsProtected: {
          include: {
            familyUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        familyLinksAsFamily: {
          include: {
            protectedUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: user.protectedProfile,
      alerts: user.protectedProfile?.alerts ?? [],
      notifications: user.notifications ?? [],
      familyLinks: {
        asProtectedUser: user.familyLinksAsProtected ?? [],
        asFamilyMember: user.familyLinksAsFamily ?? [],
      },
    };
  }

  async getAlerts() {
    const alerts = await this.prisma.alert.findMany({
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

    const protectedUserIds = [...new Set(alerts.map((alert) => alert.protectedProfile.userId))];

    const familyLinks = protectedUserIds.length
      ? await this.prisma.familyLink.findMany({
          where: {
            protectedUserId: {
              in: protectedUserIds,
            },
          },
          include: {
            familyUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
        })
      : [];

    const linksByProtectedUserId = familyLinks.reduce<Record<string, any[]>>((acc, link) => {
      const list = acc[link.protectedUserId] ?? [];
      list.push(link);
      acc[link.protectedUserId] = list;
      return acc;
    }, {});

    return alerts.map((alert) => ({
      ...alert,
      relatedFamilyMembers: linksByProtectedUserId[alert.protectedProfile.userId] ?? [],
    }));
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
