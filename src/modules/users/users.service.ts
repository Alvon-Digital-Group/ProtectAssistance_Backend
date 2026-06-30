import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async getSafeUserById(id: string) {
    const user = await this.findById(id);

    return this.sanitizeUser(user);
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

  async updateCurrentUser(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        phone: updateUserDto.phone,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
