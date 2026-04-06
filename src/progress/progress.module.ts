import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { User } from '../entities/user.entity';
import { UserProgress } from '../entities/user-progress.entity';
import { Lesson } from '../entities/lesson.entity';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProgress, Lesson, Badge, UserBadge]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
