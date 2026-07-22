import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { FirebasePushService } from './firebase-push.service';
import { NotificationsService } from './notifications.service';
import { prismaServiceMock } from '../../test/mocks/prisma-service.mock';

describe('NotificationsService', () => {
  let service: NotificationsService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
