import { Injectable, NotFoundException } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly notificationInclude = {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    },
    alert: {
      include: {
        location: true,
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
    },
  } satisfies Prisma.NotificationInclude;

  async createAlertNotifications(alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        location: true,
        protectedProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable');
    }

    const familyLinks = await this.prisma.familyLink.findMany({
      where: {
        protectedUserId: alert.protectedProfile.userId,
      },
      include: {
        familyUser: true,
      },
    });

    if (familyLinks.length === 0) {
      return [];
    }

    const title = 'Nouvelle alerte Protect Assistance';
    const body = `${alert.protectedProfile.user.firstName ?? 'Un utilisateur'} a déclenché une alerte.`;

    const notifications = await this.prisma.$transaction(
      familyLinks.map((link) =>
        this.prisma.notification.create({
          data: {
            userId: link.familyUserId,
            alertId: alert.id,
            channel: NotificationChannel.PUSH,
            status: NotificationStatus.PENDING,
            title,
            body,
            payload: {
              alertId: alert.id,
              type: alert.type,
              severity: alert.severity,
              status: alert.status,
              protectedUserId: alert.protectedProfile.userId,
              latitude: alert.location?.latitude,
              longitude: alert.location?.longitude,
            },
          },
          include: this.notificationInclude,
        }),
      ),
    );

    return notifications;
  }

  async getMyNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      include: this.notificationInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getNotificationById(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
      include: this.notificationInclude,
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    return notification;
  }
}
