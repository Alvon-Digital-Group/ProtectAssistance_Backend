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
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { EmergencyContactsService } from './emergency-contacts.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Emergency Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emergency-contacts')
export class EmergencyContactsController {
  constructor(
    private readonly emergencyContactsService: EmergencyContactsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un contact d’urgence' })
  @ApiResponse({
    status: 201,
    description: 'Contact d’urgence créé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil protégé introuvable',
  })
  createEmergencyContact(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createEmergencyContactDto: CreateEmergencyContactDto,
  ) {
    return this.emergencyContactsService.createEmergencyContact(
      user.id,
      createEmergencyContactDto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Récupérer les contacts d’urgence de l’utilisateur connecté',
  })
  getMyEmergencyContacts(@CurrentUser() user: AuthenticatedUser) {
    return this.emergencyContactsService.getMyEmergencyContacts(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un contact d’urgence par ID' })
  @ApiParam({
    name: 'id',
    description: 'ID du contact d’urgence',
  })
  getMyEmergencyContactById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.emergencyContactsService.getMyEmergencyContactById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un contact d’urgence' })
  @ApiParam({
    name: 'id',
    description: 'ID du contact d’urgence',
  })
  updateEmergencyContact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmergencyContactDto: UpdateEmergencyContactDto,
  ) {
    return this.emergencyContactsService.updateEmergencyContact(
      user.id,
      id,
      updateEmergencyContactDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un contact d’urgence' })
  @ApiParam({
    name: 'id',
    description: 'ID du contact d’urgence',
  })
  deleteEmergencyContact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.emergencyContactsService.deleteEmergencyContact(user.id, id);
  }
}
