import {
  Controller,
  Delete,
  Body,
  Post,
  BadRequestException,
  Param,
  Get,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { DashboardService } from './dashboard.service';
import { Auth, GetAuth } from 'src/core/decorator';
import { DashboardQueryDto } from './dto';
import { Role } from 'src/utils';

@Controller('/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/accounts')
  @UseGuards(JwtAuthGuard)
  async getDataAccountsDashboard(@GetAuth() auth: Auth, @Query() query: DashboardQueryDto) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission to create a new location', data: null });

    let startDate = new Date(query.startDate);
    startDate.setUTCHours(0, 0, 0, 0);
    let endDate = new Date(query.endDate);
    endDate.setUTCHours(23, 59, 59, 999);

    if (!query.startDate || !query.endDate) {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
      firstDayOfMonth.setUTCHours(0, 0, 0, 0);

      const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
      lastDayOfMonth.setUTCHours(23, 59, 59, 999);

      startDate = firstDayOfMonth;
      endDate = lastDayOfMonth;
    }

    const data = await this.dashboardService.getDataAccountsDashboard(startDate, endDate);
    if (!data) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: data,
    };
  }

  @Get('/locations')
  @UseGuards(JwtAuthGuard)
  async getDataLocationsDashboard(@GetAuth() auth: Auth, @Query() query: DashboardQueryDto) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });

    let startDate = new Date(query.startDate);
    startDate.setUTCHours(0, 0, 0, 0);
    let endDate = new Date(query.endDate);
    endDate.setUTCHours(23, 59, 59, 999);

    if (!query.startDate || !query.endDate) {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
      firstDayOfMonth.setUTCHours(0, 0, 0, 0);

      const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
      lastDayOfMonth.setUTCHours(23, 59, 59, 999);

      startDate = firstDayOfMonth;
      endDate = lastDayOfMonth;
    }

    const data = await this.dashboardService.getDataLocationsDashboard(startDate, endDate);
    if (!data) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: data,
    };
  }

  @Get('/itineraries')
  @UseGuards(JwtAuthGuard)
  async getDataItinerariesDashboard(@GetAuth() auth: Auth, @Query() query: DashboardQueryDto) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });

    let startDate = new Date(query.startDate);
    startDate.setUTCHours(0, 0, 0, 0);
    let endDate = new Date(query.endDate);
    endDate.setUTCHours(23, 59, 59, 999);

    if (!query.startDate || !query.endDate) {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();

      const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
      firstDayOfMonth.setUTCHours(0, 0, 0, 0);

      const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
      lastDayOfMonth.setUTCHours(23, 59, 59, 999);

      startDate = firstDayOfMonth;
      endDate = lastDayOfMonth;
    }

    const data = await this.dashboardService.getDataItinerariesDashboard(startDate, endDate);
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
