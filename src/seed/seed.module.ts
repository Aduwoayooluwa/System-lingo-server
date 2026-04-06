import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { World } from '../entities/world.entity';
import { Lesson } from '../entities/lesson.entity';
import { Badge } from '../entities/badge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([World, Lesson, Badge])],
  providers: [SeedService],
})
export class SeedModule {}
