import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFamilyLinkDto } from './dto/create-family-link.dto';
import { UpdateFamilyLinkDto } from './dto/update-family-link.dto';
import { FamilyLinksService } from './family-links.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Family Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-links')
export class FamilyLinksController {
  constructor(private readonly familyLinksService: FamilyLinksService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un lien entre l’utilisateur connecté et un membre famille',
  })
  @ApiResponse({
    status: 201,
    description: 'Lien familial créé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur famille introuvable',
  })
  @ApiResponse({
    status: 409,
    description: 'Lien familial déjà existant',
  })
  createFamilyLink(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createFamilyLinkDto: CreateFamilyLinkDto,
  ) {
    return this.familyLinksService.createFamilyLink(
      user.id,
      createFamilyLinkDto,
    );
  }

  @Get('as-protected-user')
  @ApiOperation({
    summary:
      'Récupérer les membres famille liés à l’utilisateur connecté protégé',
  })
  getLinksAsProtectedUser(@CurrentUser() user: AuthenticatedUser) {
    return this.familyLinksService.getLinksAsProtectedUser(user.id);
  }

  @Get('as-family-member')
  @ApiOperation({
    summary:
      'Récupérer les utilisateurs protégés liés à l’utilisateur connecté famille',
  })
  getLinksAsFamilyMember(@CurrentUser() user: AuthenticatedUser) {
    return this.familyLinksService.getLinksAsFamilyMember(user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un lien familial',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du lien familial',
  })
  updateFamilyLink(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyLinkDto: UpdateFamilyLinkDto,
  ) {
    return this.familyLinksService.updateFamilyLink(
      user.id,
      id,
      updateFamilyLinkDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un lien familial',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du lien familial',
  })
  deleteFamilyLink(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.familyLinksService.deleteFamilyLink(user.id, id);
  }
}
