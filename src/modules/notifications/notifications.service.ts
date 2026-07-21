import { Injectable, NotFoundException } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { Logger } from '@nestjs/common';
import { FirebasePushService } from './firebase-push.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebasePush: FirebasePushService,
  ) {}

  private readonly logger = new Logger(NotificationsService.name);
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
    this.logger.log(
      `Notifications created for alertId=${alert.id} count=${notifications.length}`,
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
  async sendNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          include: {
            fcmTokens: {
              where: {
                isActive: true,
              },
            },
          },
        },
        alert: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    try {
      const tokens = notification.user.fcmTokens.map((item) => item.token);

      await this.firebasePush.sendPushToTokens({
        tokens,
        title: notification.title,
        body: notification.body,
        data: {
          notificationId: notification.id,
          alertId: notification.alertId ?? '',
        },
      });

      return this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          errorMessage: null,
        },
        include: this.notificationInclude,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'FCM send failed';

      this.logger.error(message);

      return this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage: message,
        },
        include: this.notificationInclude,
      });
    }
  }

  async sendPendingNotificationsForAlert(alertId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        alertId,
        status: NotificationStatus.PENDING,
      },
    });

    const results = [];

    for (const notification of notifications) {
      const result = await this.sendNotification(notification.id);
      results.push(result);
    }

    return results;
  }
}
