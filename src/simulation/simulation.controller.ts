import { Controller, Post, Body } from '@nestjs/common';
import { SimulationService } from './simulation.service';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, Allow } from 'class-validator';
import { Type } from 'class-transformer';

class SimNodeDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsOptional()
  @Allow()
  data?: Record<string, any>;
}

class SimEdgeDto {
  @IsString()
  id: string;

  @IsString()
  source: string;

  @IsString()
  target: string;
}

class RunSimulationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimNodeDto)
  nodes: SimNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SimEdgeDto)
  edges: SimEdgeDto[];

  @IsNumber()
  requestCount: number;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expectedComponents?: string[];
}

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('run')
  runSimulation(@Body() dto: RunSimulationDto) {
    return this.simulationService.run(dto);
  }
}
