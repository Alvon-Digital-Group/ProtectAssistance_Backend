import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async createUser(data: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role?: UserRole;
  }) {
    const existingUser = await this.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cet email');
    }

    return this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role ?? UserRole.PROTECTED_USER,
      },
    });
  }
}
