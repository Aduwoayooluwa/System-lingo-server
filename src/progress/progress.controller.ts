import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  getUserProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.sub);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.progressService.getStats(req.user.sub);
  }

  @Post(':lessonId/start')
  startLesson(@Request() req, @Param('lessonId') lessonId: string) {
    return this.progressService.startLesson(req.user.sub, lessonId);
  }

  @Post(':lessonId/step')
  updateStep(
    @Request() req,
    @Param('lessonId') lessonId: string,
    @Body('step') step: number,
  ) {
    return this.progressService.updateStep(req.user.sub, lessonId, step);
  }

  @Post(':lessonId/complete')
  completeLesson(
    @Request() req,
    @Param('lessonId') lessonId: string,
    @Body('score') score: number,
    @Body('canvasState') canvasState?: any,
  ) {
    return this.progressService.completeLesson(req.user.sub, lessonId, score || 100, canvasState);
  }
}
