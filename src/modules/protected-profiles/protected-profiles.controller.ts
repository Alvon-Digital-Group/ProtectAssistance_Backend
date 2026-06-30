import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProtectedProfileDto } from './dto/create-protected-profile.dto';
import { UpdateProtectedProfileDto } from './dto/update-protected-profile.dto';
import { ProtectedProfilesService } from './protected-profiles.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Protected Profiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('protected-profiles')
export class ProtectedProfilesController {
  constructor(
    private readonly protectedProfilesService: ProtectedProfilesService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Récupérer le profil protégé de l’utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil protégé récupéré avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil protégé introuvable',
  })
  getMyProtectedProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.protectedProfilesService.getMyProtectedProfile(user.id);
  }

  @Post('me')
  @ApiOperation({
    summary: 'Créer le profil protégé de l’utilisateur connecté',
  })
  @ApiResponse({
    status: 201,
    description: 'Profil protégé créé avec succès',
  })
  @ApiResponse({
    status: 409,
    description: 'Un profil protégé existe déjà pour cet utilisateur',
  })
  createMyProtectedProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createProtectedProfileDto: CreateProtectedProfileDto,
  ) {
    return this.protectedProfilesService.createMyProtectedProfile(
      user.id,
      createProtectedProfileDto,
    );
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Mettre à jour le profil protégé de l’utilisateur connecté',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil protégé mis à jour avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil protégé introuvable',
  })
  updateMyProtectedProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateProtectedProfileDto: UpdateProtectedProfileDto,
  ) {
    return this.protectedProfilesService.updateMyProtectedProfile(
      user.id,
      updateProtectedProfileDto,
    );
  }
}
