import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { NotificationStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { FirebasePushService } from './firebase-push.service';
import { NotificationsService } from './notifications.service';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let alertFindUniqueMock: jest.Mock;
  let notificationFindManyMock: jest.Mock;
  let notificationFindUniqueMock: jest.Mock;
  let notificationUpdateMock: jest.Mock;

  const firebasePushServiceMock = {
    sendPushToTokens: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: FirebasePushService,
          useValue: firebasePushServiceMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    alertFindUniqueMock = prismaServiceMock.alert.findUnique as jest.Mock;
    notificationFindManyMock = prismaServiceMock.notification
      .findMany as jest.Mock;
    notificationFindUniqueMock = prismaServiceMock.notification
      .findUnique as jest.Mock;
    notificationUpdateMock = prismaServiceMock.notification.update as jest.Mock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects send-pending when requester is not the alert owner', async () => {
    alertFindUniqueMock.mockResolvedValue({
      protectedProfile: {
        userId: 'owner-id',
      },
    });

    await expect(
      service.sendPendingNotificationsForAlert('alert-id', 'other-user-id'),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(notificationFindManyMock).not.toHaveBeenCalled();
  });

  it('sends pending notifications when requester owns the alert', async () => {
    alertFindUniqueMock.mockResolvedValue({
      protectedProfile: {
        userId: 'owner-id',
      },
    });
    notificationFindManyMock.mockResolvedValue([
      {
        id: 'notification-id',
      },
    ]);
    notificationFindUniqueMock.mockResolvedValue({
      id: 'notification-id',
      title: 'Title',
      body: 'Body',
      alertId: 'alert-id',
      user: {
        fcmTokens: [{ token: 'token-1' }],
      },
      alert: {
        id: 'alert-id',
      },
    });
    notificationUpdateMock.mockResolvedValue({
      id: 'notification-id',
      status: NotificationStatus.SENT,
    });
    firebasePushServiceMock.sendPushToTokens.mockResolvedValue(undefined);

    const result = await service.sendPendingNotificationsForAlert(
      'alert-id',
      'owner-id',
    );

    expect(notificationFindManyMock).toHaveBeenCalledWith({
      where: {
        alertId: 'alert-id',
        status: NotificationStatus.PENDING,
      },
    });
    expect(firebasePushServiceMock.sendPushToTokens).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 'notification-id',
        status: NotificationStatus.SENT,
      },
    ]);
  });
});
