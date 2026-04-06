import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { WorldsService } from './worlds.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtGuard } from './optional-jwt.guard';

@Controller('worlds')
export class WorldsController {
  constructor(private readonly worldsService: WorldsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  getAllWorlds(@Request() req) {
    return this.worldsService.getAllWorlds(req.user?.sub);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtGuard)
  getWorldBySlug(@Param('slug') slug: string, @Request() req) {
    return this.worldsService.getWorldBySlug(slug, req.user?.sub);
  }
}

@Controller('lessons')
export class LessonsController {
  constructor(private readonly worldsService: WorldsService) {}

  @Get(':slug')
  @UseGuards(OptionalJwtGuard)
  getLessonBySlug(@Param('slug') slug: string, @Request() req) {
    return this.worldsService.getLessonBySlug(slug, req.user?.sub);
  }
}
