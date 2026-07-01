import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';

@Injectable()
export class EmergencyContactsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getProtectedProfileByUserId(userId: string) {
    const protectedProfile = await this.prisma.protectedProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!protectedProfile) {
      throw new NotFoundException(
        'Profil protégé introuvable. Veuillez créer un profil protégé avant d’ajouter des contacts d’urgence.',
      );
    }

    return protectedProfile;
  }

  async createEmergencyContact(
    userId: string,
    createEmergencyContactDto: CreateEmergencyContactDto,
  ) {
    const protectedProfile = await this.getProtectedProfileByUserId(userId);

    return this.prisma.emergencyContact.create({
      data: {
        protectedProfileId: protectedProfile.id,
        name: createEmergencyContactDto.name,
        phone: createEmergencyContactDto.phone,
        email: createEmergencyContactDto.email,
        priority: createEmergencyContactDto.priority ?? 1,
        receiveSms: createEmergencyContactDto.receiveSms ?? true,
        receivePush: createEmergencyContactDto.receivePush ?? false,
        receiveEmail: createEmergencyContactDto.receiveEmail ?? false,
        receiveCall: createEmergencyContactDto.receiveCall ?? false,
      },
    });
  }

  async getMyEmergencyContacts(userId: string) {
    const protectedProfile = await this.getProtectedProfileByUserId(userId);

    return this.prisma.emergencyContact.findMany({
      where: {
        protectedProfileId: protectedProfile.id,
      },
      orderBy: [
        {
          priority: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async getMyEmergencyContactById(userId: string, contactId: string) {
    const protectedProfile = await this.getProtectedProfileByUserId(userId);

    const emergencyContact = await this.prisma.emergencyContact.findFirst({
      where: {
        id: contactId,
        protectedProfileId: protectedProfile.id,
      },
    });

    if (!emergencyContact) {
      throw new NotFoundException('Contact d’urgence introuvable');
    }

    return emergencyContact;
  }

  async updateEmergencyContact(
    userId: string,
    contactId: string,
    updateEmergencyContactDto: UpdateEmergencyContactDto,
  ) {
    const protectedProfile = await this.getProtectedProfileByUserId(userId);

    const existingContact = await this.prisma.emergencyContact.findFirst({
      where: {
        id: contactId,
        protectedProfileId: protectedProfile.id,
      },
    });

    if (!existingContact) {
      throw new NotFoundException('Contact d’urgence introuvable');
    }

    return this.prisma.emergencyContact.update({
      where: {
        id: contactId,
      },
      data: {
        name: updateEmergencyContactDto.name,
        phone: updateEmergencyContactDto.phone,
        email: updateEmergencyContactDto.email,
        priority: updateEmergencyContactDto.priority,
        receiveSms: updateEmergencyContactDto.receiveSms,
        receivePush: updateEmergencyContactDto.receivePush,
        receiveEmail: updateEmergencyContactDto.receiveEmail,
        receiveCall: updateEmergencyContactDto.receiveCall,
      },
    });
  }

  async deleteEmergencyContact(userId: string, contactId: string) {
    const protectedProfile = await this.getProtectedProfileByUserId(userId);

    const existingContact = await this.prisma.emergencyContact.findFirst({
      where: {
        id: contactId,
        protectedProfileId: protectedProfile.id,
      },
    });

    if (!existingContact) {
      throw new NotFoundException('Contact d’urgence introuvable');
    }

    await this.prisma.emergencyContact.delete({
      where: {
        id: contactId,
      },
    });

    return {
      message: 'Contact d’urgence supprimé avec succès',
    };
  }
}
