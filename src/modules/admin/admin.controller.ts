import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';


@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Lister les utilisateurs' })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Lister les alertes' })
  getAlerts() {
    return this.adminService.getAlerts();
  }

  @Get('users/:id/dashboard')
  @ApiOperation({ summary: 'Récupérer le dashboard complet d’un utilisateur' })
  getUserDashboard(@Param('id') id: string) {
    return this.adminService.getUserDashboardById(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Récupérer les statistiques admin' })
  getStats() {
    return this.adminService.getStats();
  }
}