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
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSafeZoneDto } from './dto/create-safe-zone.dto';
import { UpdateSafeZoneDto } from './dto/update-safe-zone.dto';
import { SafeZonesService } from './safe-zones.service';

type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
};

@ApiTags('Safe Zones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('safe-zones')
export class SafeZonesController {
  constructor(private readonly safeZonesService: SafeZonesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une zone de sécurité' })
  createSafeZone(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSafeZoneDto,
  ) {
    return this.safeZonesService.createSafeZone(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer mes zones de sécurité' })
  getMySafeZones(@CurrentUser() user: AuthenticatedUser) {
    return this.safeZonesService.getMySafeZones(user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer mes zones de sécurité actives' })
  getMyActiveSafeZones(@CurrentUser() user: AuthenticatedUser) {
    return this.safeZonesService.getMyActiveSafeZones(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une zone par ID' })
  @ApiParam({ name: 'id' })
  getSafeZoneById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.safeZonesService.getSafeZoneById(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une zone de sécurité' })
  updateSafeZone(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSafeZoneDto,
  ) {
    return this.safeZonesService.updateSafeZone(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une zone de sécurité' })
  deleteSafeZone(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.safeZonesService.deleteSafeZone(user.id, id);
  }
}
