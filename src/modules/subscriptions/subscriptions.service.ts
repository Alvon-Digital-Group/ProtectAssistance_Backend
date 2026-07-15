import { Injectable } from '@nestjs/common';
import { PlanType, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  getFeatureLimits(planType: PlanType) {
    if (planType === PlanType.PREMIUM) {
      return {
        maxEmergencyContacts: 10,
        maxSafeZones: 20,
        maxEvidenceStorageMb: 5000,
        cloudStorage: true,
      };
    }

    return {
      maxEmergencyContacts: 2,
      maxSafeZones: 1,
      maxEvidenceStorageMb: 100,
      cloudStorage: false,
    };
  }

  async getOrCreateMySubscription(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          plan: PlanType.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }

    return {
      ...subscription,
      limits: this.getFeatureLimits(subscription.plan),
    };
  }

  async updateMySubscription(userId: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: dto.planType,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: null,
      },
      create: {
        userId,
        plan: dto.planType,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    return {
      ...subscription,
      limits: this.getFeatureLimits(subscription.plan),
    };
  }
}
