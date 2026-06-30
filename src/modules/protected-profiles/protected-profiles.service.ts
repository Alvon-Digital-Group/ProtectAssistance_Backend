import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProtectedProfileDto } from './dto/create-protected-profile.dto';
import { UpdateProtectedProfileDto } from './dto/update-protected-profile.dto';

@Injectable()
export class ProtectedProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProtectedProfile(userId: string) {
    const protectedProfile = await this.prisma.protectedProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
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
    });

    if (!protectedProfile) {
      throw new NotFoundException('Profil protégé introuvable');
    }

    return protectedProfile;
  }

  async createMyProtectedProfile(
    userId: string,
    createProtectedProfileDto: CreateProtectedProfileDto,
  ) {
    const existingProfile = await this.prisma.protectedProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      throw new ConflictException(
        'Un profil protégé existe déjà pour cet utilisateur',
      );
    }

    return this.prisma.protectedProfile.create({
      data: {
        userId,
        birthDate: createProtectedProfileDto.birthDate
          ? new Date(createProtectedProfileDto.birthDate)
          : undefined,
        address: createProtectedProfileDto.address,
        emergencyNote: createProtectedProfileDto.emergencyNote,
        medicalInfo: createProtectedProfileDto.medicalInfo,
        isActive: createProtectedProfileDto.isActive ?? true,
      },
    });
  }

  async updateMyProtectedProfile(
    userId: string,
    updateProtectedProfileDto: UpdateProtectedProfileDto,
  ) {
    const existingProfile = await this.prisma.protectedProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profil protégé introuvable');
    }

    return this.prisma.protectedProfile.update({
      where: {
        userId,
      },
      data: {
        birthDate: updateProtectedProfileDto.birthDate
          ? new Date(updateProtectedProfileDto.birthDate)
          : undefined,
        address: updateProtectedProfileDto.address,
        emergencyNote: updateProtectedProfileDto.emergencyNote,
        medicalInfo: updateProtectedProfileDto.medicalInfo,
        isActive: updateProtectedProfileDto.isActive,
      },
    });
  }
}
