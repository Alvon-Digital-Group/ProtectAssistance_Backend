import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
};

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer le profil de l’utilisateur connecté' })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur récupéré avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant ou invalide',
  })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getSafeUserById(user.id);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Mettre à jour le profil de l’utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil utilisateur mis à jour avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT manquant ou invalide',
  })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateCurrentUser(user.id, updateUserDto);
  }
}
