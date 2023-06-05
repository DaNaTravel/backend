import { IsOptional, IsString } from 'class-validator';

export class DashboardQueryDto {
  @IsString()
  @IsOptional()
  startDate: string;

  @IsString()
  @IsOptional()
  endDate: string;

  @IsString()
  name: string;
}
