import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';

export enum ProgressStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('user_progress')
@Unique(['userId', 'lessonId'])
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.progress)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  lessonId: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.userProgress)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @Column({
    type: 'enum',
    enum: ProgressStatus,
    default: ProgressStatus.LOCKED,
  })
  status: ProgressStatus;

  @Column({ default: 0 })
  score: number;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ default: 0 })
  currentStep: number;

  @Column('jsonb', { nullable: true })
  canvasState: any;

  @CreateDateColumn()
  createdAt: Date;
}
