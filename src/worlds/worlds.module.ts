import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorldsController, LessonsController } from './worlds.controller';
import { WorldsService } from './worlds.service';
import { World } from '../entities/world.entity';
import { Lesson } from '../entities/lesson.entity';
import { UserProgress } from '../entities/user-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([World, Lesson, UserProgress])],
  controllers: [WorldsController, LessonsController],
  providers: [WorldsService],
  exports: [WorldsService],
})
export class WorldsModule {}
