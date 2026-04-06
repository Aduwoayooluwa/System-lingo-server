import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserProgress, ProgressStatus } from '../entities/user-progress.entity';
import { Lesson } from '../entities/lesson.entity';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(UserProgress)
    private progressRepo: Repository<UserProgress>,
    @InjectRepository(Lesson)
    private lessonsRepo: Repository<Lesson>,
    @InjectRepository(Badge)
    private badgesRepo: Repository<Badge>,
    @InjectRepository(UserBadge)
    private userBadgesRepo: Repository<UserBadge>,
  ) {}

  async getUserProgress(userId: string) {
    const progress = await this.progressRepo.find({
      where: { userId },
      relations: ['lesson', 'lesson.world'],
      order: { createdAt: 'ASC' },
    });

    return progress;
  }

  async getStats(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check if streak should be reset due to inactivity
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate).toISOString().split('T')[0]
      : null;

    if (
      user.currentStreak > 0 &&
      lastActive !== today &&
      lastActive !== yesterdayStr
    ) {
      user.currentStreak = 0;
      await this.usersRepo.save(user);
    }

    const completedCount = await this.progressRepo.count({
      where: { userId, status: ProgressStatus.COMPLETED },
    });

    const badges = await this.userBadgesRepo.find({
      where: { userId },
      relations: ['badge'],
      order: { earnedAt: 'DESC' },
    });

    return {
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedLessons: completedCount,
      badges: badges.map((ub) => ub.badge),
    };
  }

  async startLesson(userId: string, lessonId: string) {
    const lesson = await this.lessonsRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    let progress = await this.progressRepo.findOne({
      where: { userId, lessonId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        userId,
        lessonId,
        status: ProgressStatus.IN_PROGRESS,
        currentStep: 0,
      });
    } else {
      progress.status = ProgressStatus.IN_PROGRESS;
    }

    await this.progressRepo.save(progress);
    return progress;
  }

  async updateStep(userId: string, lessonId: string, step: number) {
    const progress = await this.progressRepo.findOne({
      where: { userId, lessonId },
    });

    if (!progress) throw new NotFoundException('Progress not found. Start the lesson first.');

    progress.currentStep = step;
    await this.progressRepo.save(progress);
    return progress;
  }

  async completeLesson(userId: string, lessonId: string, score: number, canvasState?: any) {
    const lesson = await this.lessonsRepo.findOne({
      where: { id: lessonId },
      relations: ['world', 'world.lessons'],
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    // Check if re-completing
    let progress = await this.progressRepo.findOne({
      where: { userId, lessonId },
    });

    const isReview = progress?.status === ProgressStatus.COMPLETED;

    if (!progress) {
      progress = this.progressRepo.create({
        userId,
        lessonId,
        status: ProgressStatus.COMPLETED,
        score,
        canvasState,
        completedAt: new Date(),
      });
    } else {
      progress.status = ProgressStatus.COMPLETED;
      progress.score = Math.max(progress.score, score);
      progress.completedAt = new Date();
      if (canvasState) {
        progress.canvasState = canvasState;
      }
    }

    await this.progressRepo.save(progress);

    // Award XP: full for first, 25% for review
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const xpEarned = isReview
      ? Math.round(lesson.xpReward * 0.25)
      : lesson.xpReward;

    user.xp += xpEarned;
    user.level = this.calculateLevel(user.xp);

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActiveDate
      ? new Date(user.lastActiveDate).toISOString().split('T')[0]
      : null;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActive === yesterdayStr) {
        user.currentStreak += 1;
      } else if (lastActive !== today) {
        user.currentStreak = 1;
      }

      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      user.lastActiveDate = new Date();
    }

    await this.usersRepo.save(user);

    // Unlock next lesson
    const worldLessons = lesson.world.lessons.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    const currentIndex = worldLessons.findIndex((l) => l.id === lessonId);
    const nextLesson = worldLessons[currentIndex + 1];

    if (nextLesson) {
      let nextProgress = await this.progressRepo.findOne({
        where: { userId, lessonId: nextLesson.id },
      });

      if (!nextProgress) {
        nextProgress = this.progressRepo.create({
          userId,
          lessonId: nextLesson.id,
          status: ProgressStatus.AVAILABLE,
        });
        await this.progressRepo.save(nextProgress);
      } else if (nextProgress.status === ProgressStatus.LOCKED) {
        nextProgress.status = ProgressStatus.AVAILABLE;
        await this.progressRepo.save(nextProgress);
      }
    }

    // Check badge criteria
    const earnedBadges = await this.checkBadgeCriteria(userId);

    return {
      progress,
      xpEarned,
      isReview,
      fullXp: lesson.xpReward,
      newLevel: user.level,
      totalXp: user.xp,
      streak: user.currentStreak,
      nextLesson: nextLesson
        ? { id: nextLesson.id, title: nextLesson.title, slug: nextLesson.slug }
        : null,
      earnedBadges,
    };
  }

  private calculateLevel(xp: number): number {
    // XP thresholds: Level 1 = 0, Level 2 = 100, Level 3 = 250, etc.
    const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000];
    let level = 1;
    for (let i = 1; i < thresholds.length; i++) {
      if (xp >= thresholds[i]) {
        level = i + 1;
      } else {
        break;
      }
    }
    return level;
  }

  private async checkBadgeCriteria(userId: string): Promise<Badge[]> {
    const allBadges = await this.badgesRepo.find();
    const existingBadges = await this.userBadgesRepo.find({
      where: { userId },
    });
    const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return [];
    const completedCount = await this.progressRepo.count({
      where: { userId, status: ProgressStatus.COMPLETED },
    });

    const newBadges: Badge[] = [];

    for (const badge of allBadges) {
      if (existingBadgeIds.has(badge.id)) continue;

      const criteria = badge.criteria as any;
      if (!criteria) continue;

      let earned = false;

      if (criteria.type === 'lessons_completed' && completedCount >= criteria.count) {
        earned = true;
      } else if (criteria.type === 'streak' && user.currentStreak >= criteria.count) {
        earned = true;
      } else if (criteria.type === 'xp' && user.xp >= criteria.count) {
        earned = true;
      } else if (criteria.type === 'level' && user.level >= criteria.count) {
        earned = true;
      }

      if (earned) {
        const userBadge = this.userBadgesRepo.create({
          userId,
          badgeId: badge.id,
        });
        await this.userBadgesRepo.save(userBadge);
        newBadges.push(badge);
      }
    }

    return newBadges;
  }
}
