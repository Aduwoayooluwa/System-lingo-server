import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { World } from '../entities/world.entity';
import { Lesson } from '../entities/lesson.entity';
import { UserProgress, ProgressStatus } from '../entities/user-progress.entity';

@Injectable()
export class WorldsService {
  constructor(
    @InjectRepository(World)
    private worldsRepo: Repository<World>,
    @InjectRepository(Lesson)
    private lessonsRepo: Repository<Lesson>,
    @InjectRepository(UserProgress)
    private progressRepo: Repository<UserProgress>,
  ) {}

  async getAllWorlds(userId?: string) {
    const worlds = await this.worldsRepo.find({
      order: { orderIndex: 'ASC' },
      relations: ['lessons'],
    });

    if (userId) {
      const progress = await this.progressRepo.find({
        where: { userId },
      });

      const progressMap = new Map(
        progress.map((p) => [p.lessonId, p]),
      );

      return worlds.map((world) => {
        const sortedLessons = world.lessons.sort((a, b) => a.orderIndex - b.orderIndex);
        let previousCompleted = true; // first lesson is always available

        const lessons = sortedLessons.map((lesson) => {
          const lessonProgress = progressMap.get(lesson.id);
          let status: ProgressStatus;

          if (lessonProgress) {
            status = lessonProgress.status;
          } else if (previousCompleted) {
            status = ProgressStatus.AVAILABLE;
          } else {
            status = ProgressStatus.LOCKED;
          }

          // Only unlock next if current is completed
          if (lessonProgress?.status === ProgressStatus.COMPLETED) {
            previousCompleted = true;
          } else {
            previousCompleted = false;
          }

          return {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
            xpReward: lesson.xpReward,
            challengeType: lesson.challengeType,
            status,
            score: lessonProgress?.score || 0,
          };
        });

        return {
          ...world,
          lessons,
          completedCount: lessons.filter(
            (l) => l.status === ProgressStatus.COMPLETED,
          ).length,
          totalLessons: lessons.length,
        };
      });
    }

    // Unauthenticated: first lesson of each world is available, rest locked
    return worlds.map((world) => {
      const sortedLessons = world.lessons.sort((a, b) => a.orderIndex - b.orderIndex);
      return {
        ...world,
        lessons: sortedLessons.map((l, i) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          description: l.description,
          orderIndex: l.orderIndex,
          xpReward: l.xpReward,
          challengeType: l.challengeType,
          status: i === 0 ? ProgressStatus.AVAILABLE : ProgressStatus.LOCKED,
          score: 0,
        })),
        completedCount: 0,
        totalLessons: sortedLessons.length,
      };
    });
  }

  async getWorldBySlug(slug: string, userId?: string) {
    const world = await this.worldsRepo.findOne({
      where: { slug },
      relations: ['lessons'],
    });

    if (!world) {
      throw new NotFoundException('World not found');
    }

    if (userId) {
      const progress = await this.progressRepo.find({
        where: { userId },
      });
      const progressMap = new Map(progress.map((p) => [p.lessonId, p]));

      return {
        ...world,
        lessons: world.lessons
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((lesson) => {
            const lessonProgress = progressMap.get(lesson.id);
            return {
              ...lesson,
              status: lessonProgress?.status || ProgressStatus.LOCKED,
              score: lessonProgress?.score || 0,
              currentStep: lessonProgress?.currentStep || 0,
            };
          }),
      };
    }

    return {
      ...world,
      lessons: world.lessons.sort((a, b) => a.orderIndex - b.orderIndex),
    };
  }

  async getLessonBySlug(slug: string, userId?: string) {
    const lesson = await this.lessonsRepo.findOne({
      where: { slug },
      relations: ['world'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (userId) {
      const progress = await this.progressRepo.findOne({
        where: { userId, lessonId: lesson.id },
      });

      return {
        ...lesson,
        status: progress?.status || ProgressStatus.LOCKED,
        score: progress?.score || 0,
        currentStep: progress?.currentStep || 0,
        userProgress: progress ? [progress] : [],
      };
    }

    return lesson;
  }
}
