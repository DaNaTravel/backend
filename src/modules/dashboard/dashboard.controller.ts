import { Controller, BadRequestException, Get, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { DashboardService } from './dashboard.service';
import { Auth, GetAuth } from 'src/core/decorator';
import { DashboardQueryDto } from './dto';
import { Role } from 'src/utils';

@Controller('/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@GetAuth() auth: Auth, @Query() query: DashboardQueryDto) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission to create a new location', data: null });

    const data = await this.dashboardService.getDashboard(query);

    if (!data) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: data,
    };
  }

  @Get('/overview')
  @UseGuards(JwtAuthGuard)
  async getDataOverviewDashboard(@GetAuth() auth: Auth) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });

    const data = await this.dashboardService.getDataOverviewDashboard();
    if (!data) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: data,
    };
  }
}
