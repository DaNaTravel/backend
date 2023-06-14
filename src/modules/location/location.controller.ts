import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UsePipes,
  Body,
  ValidationPipe,
  BadRequestException,
  NotFoundException,
  Delete,
  Patch,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { Role } from 'src/utils';
import { Auth, GetAuth } from 'src/core/decorator';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { LocationService } from './location.service';
import { LocationQueryDto, LocationDto, LocationUpdateDto } from './dto';
import { PATH_CONTAIN_ID } from 'src/constants';

@Controller('/locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @UsePipes(new ValidationPipe({ skipMissingProperties: true, transformOptions: { enableImplicitConversion: true } }))
  @Get()
  async getListLocations(@Query() dto: LocationQueryDto) {
    return this.locationService.getListLocations(dto);
  }

  @Get(`/:locationId${PATH_CONTAIN_ID}`)
  async getDetailLocation(@Param('locationId') locationId: string) {
    const locations = await this.locationService.getDetailLocation(locationId);
    return {
      mesage: 'Success',
      data: locations,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createLocation(@Body() locationDto: LocationDto, @GetAuth() auth: Auth) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission to create a new location', data: null });

    const checkValidate = await this.locationService.checkLocation(locationDto);
    if (checkValidate[0] === false) throw new BadRequestException({ message: `${checkValidate[1]}`, data: null });

    const location = await this.locationService.createLocation(locationDto);

    return {
      mesage: 'Success',
      data: location,
    };
  }

  @Delete(`/:locationId${PATH_CONTAIN_ID}`)
  @UseGuards(JwtAuthGuard)
  async removeLocationById(@Param('locationId') locationId: ObjectId, @GetAuth() auth: Auth) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission to delete location', data: null });

    const isExistedLocation = await this.locationService.checkExistedLocationById(locationId);
    if (isExistedLocation === false) throw new NotFoundException({ message: 'Not found', data: null });

    const deletedItem = await this.locationService.removeLocationById(locationId);

    if (!deletedItem) throw new BadRequestException({ message: 'Bad Request', data: null });
    return {
      mesage: 'Success',
      data: deletedItem,
    };
  }

  @Patch(`/:locationId${PATH_CONTAIN_ID}`)
  @UseGuards(JwtAuthGuard)
  async updateLocation(
    @GetAuth() auth: Auth,
    @Param('locationId') locationId: ObjectId,
    @Body() changedInfo: LocationUpdateDto,
  ) {
    if (auth.role !== Role.ADMIN)
      throw new UnauthorizedException({ message: 'You do not have permission', data: null });

    if (!Object.keys(changedInfo).length) {
      throw new BadRequestException('No changes found');
    }

    const updatedLocaton = await this.locationService.updatedLocation(locationId, changedInfo);
    if (!updatedLocaton) throw new BadRequestException('Bad Request');
    return {
      message: 'Success',
      data: updatedLocaton,
    };
  }

  @Get('/recommended')
  async getRecommendedLocationsHomePage() {
    const locations = await this.locationService.getRecommendedLocationsHomePage();
    if (!locations) throw new BadRequestException('Bad Request');

    return {
      message: 'Success',
      data: locations,
    };
  }
}
