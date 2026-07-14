import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSafeZoneDto } from './dto/create-safe-zone.dto';
import { UpdateSafeZoneDto } from './dto/update-safe-zone.dto';

@Injectable()
export class SafeZonesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProtectedProfileByUserId(userId: string) {
    const profile = await this.prisma.protectedProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil protégé introuvable');
    }

    return profile;
  }

  async createSafeZone(userId: string, dto: CreateSafeZoneDto) {
    const profile = await this.getProtectedProfileByUserId(userId);

    return this.prisma.safeZone.create({
      data: {
        protectedProfileId: profile.id,
        name: dto.name,
        centerLatitude: dto.centerLatitude,
        centerLongitude: dto.centerLongitude,
        radiusMeters: dto.radiusMeters,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async getMySafeZones(userId: string) {
    const profile = await this.getProtectedProfileByUserId(userId);

    return this.prisma.safeZone.findMany({
      where: { protectedProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyActiveSafeZones(userId: string) {
    const profile = await this.getProtectedProfileByUserId(userId);

    return this.prisma.safeZone.findMany({
      where: {
        protectedProfileId: profile.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSafeZoneById(userId: string, id: string) {
    const profile = await this.getProtectedProfileByUserId(userId);

    const safeZone = await this.prisma.safeZone.findFirst({
      where: {
        id,
        protectedProfileId: profile.id,
      },
    });

    if (!safeZone) {
      throw new NotFoundException('Zone de sécurité introuvable');
    }

    return safeZone;
  }

  async updateSafeZone(userId: string, id: string, dto: UpdateSafeZoneDto) {
    await this.getSafeZoneById(userId, id);

    return this.prisma.safeZone.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSafeZone(userId: string, id: string) {
    await this.getSafeZoneById(userId, id);

    await this.prisma.safeZone.delete({
      where: { id },
    });

    return {
      message: 'Zone de sécurité supprimée avec succès',
    };
  }
}
