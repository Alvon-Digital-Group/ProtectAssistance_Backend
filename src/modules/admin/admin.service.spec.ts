import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../database/prisma.service';

describe('AdminService', () => {
  let service: AdminService;

  const prismaServiceMock = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    alert: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    familyLink: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should return dashboard data for a user with alerts, notifications and family links', async () => {
    prismaServiceMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      firstName: 'Alice',
      lastName: 'Dupont',
      email: 'alice@test.com',
      phone: '+33600000000',
      role: 'PROTECTED_USER',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      protectedProfile: {
        id: 'profile-1',
        userId: 'user-1',
        alerts: [
          {
            id: 'alert-1',
            type: 'PANIC_BUTTON',
            status: 'SENT',
            createdAt: new Date('2024-01-02T00:00:00.000Z'),
            location: { id: 'loc-1', latitude: 48.8566, longitude: 2.3522 },
          },
        ],
      },
      notifications: [
        {
          id: 'notif-1',
          title: 'Alerte reçue',
          body: 'Votre proche a déclenché une alerte',
          createdAt: new Date('2024-01-03T00:00:00.000Z'),
        },
      ],
      familyLinksAsProtected: [
        {
          id: 'link-1',
          relationship: 'Mère',
          familyUser: { id: 'family-1', firstName: 'Marie', lastName: 'Dupont' },
        },
      ],
      familyLinksAsFamily: [
        {
          id: 'link-2',
          relationship: 'Fille',
          protectedUser: { id: 'protected-2', firstName: 'Paul', lastName: 'Dupont' },
        },
      ],
    });

    const result = await service.getUserDashboardById('user-1');

    expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
      }),
    );
    expect(result.user.id).toBe('user-1');
    expect(result.alerts).toHaveLength(1);
    expect(result.notifications).toHaveLength(1);
    expect(result.familyLinks.asProtectedUser).toHaveLength(1);
    expect(result.familyLinks.asFamilyMember).toHaveLength(1);
  });

  it('should attach related family members to each admin alert', async () => {
    prismaServiceMock.alert.findMany.mockResolvedValue([
      {
        id: 'alert-1',
        type: 'PANIC_BUTTON',
        status: 'CREATED',
        severity: 'HIGH',
        message: 'Alerte déclenchée',
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        protectedProfile: {
          id: 'profile-1',
          userId: 'user-1',
          user: {
            id: 'user-1',
            firstName: 'Alice',
            lastName: 'Dupont',
            email: 'alice@test.com',
            phone: '+33600000000',
          },
        },
        location: { id: 'loc-1', latitude: 48.8566, longitude: 2.3522 },
        evidence: [],
        notifications: [],
      },
    ]);

    prismaServiceMock.familyLink.findMany.mockResolvedValue([
      {
        id: 'link-1',
        protectedUserId: 'user-1',
        familyUserId: 'family-1',
        relationship: 'Mère',
        permissionLevel: 'RECEIVE_ALERTS',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        familyUser: {
          id: 'family-1',
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie@test.com',
          phone: '+33611111111',
          role: 'FAMILY_MEMBER',
        },
      },
    ]);

    const result = await service.getAlerts();

    expect(prismaServiceMock.alert.findMany).toHaveBeenCalledTimes(1);
    expect(prismaServiceMock.familyLink.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { protectedUserId: { in: ['user-1'] } },
        include: { familyUser: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } } },
      }),
    );
    expect(result[0].relatedFamilyMembers).toHaveLength(1);
    expect(result[0].relatedFamilyMembers[0].familyUser.firstName).toBe('Marie');
  });
});
