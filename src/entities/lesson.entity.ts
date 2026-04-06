import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { World } from './world.entity';
import { UserProgress } from './user-progress.entity';

export enum ChallengeType {
  FIX_THE_SYSTEM = 'fix_the_system',
  DESIGN_FROM_SCRATCH = 'design_from_scratch',
  SCALE_UP = 'scale_up',
  TRADE_OFF = 'trade_off',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  worldId: string;

  @ManyToOne(() => World, (world) => world.lessons)
  @JoinColumn({ name: 'worldId' })
  world: World;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column()
  orderIndex: number;

  @Column('text')
  storyContext: string;

  @Column('jsonb')
  steps: LessonStep[];

  @Column({
    type: 'enum',
    enum: ChallengeType,
    default: ChallengeType.FIX_THE_SYSTEM,
  })
  challengeType: ChallengeType;

  @Column('jsonb', { nullable: true })
  challengeConfig: Record<string, any>;

  @Column({ default: 50 })
  xpReward: number;

  @Column('jsonb', { nullable: true })
  initialCanvasState: CanvasState | null;

  @Column('jsonb', { nullable: true })
  targetCanvasState: CanvasState | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserProgress, (progress) => progress.lesson)
  userProgress: UserProgress[];
}

export interface LessonStep {
  id: string;
  type: 'narrative' | 'action' | 'quiz' | 'canvas_task';
  character?: string;
  emotion?: string;
  dialogue?: string;
  instruction?: string;
  action?: {
    type: 'drag_component' | 'connect_nodes' | 'run_simulation' | 'select_option';
    componentType?: string;
    sourceNode?: string;
    targetNode?: string;
    options?: { id: string; label: string; correct: boolean; explanation: string }[];
  };
  hint?: string;
  successMessage?: string;
}

export interface CanvasState {
  nodes: {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    animated?: boolean;
  }[];
}
