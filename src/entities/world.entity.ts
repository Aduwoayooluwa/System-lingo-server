import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity('worlds')
export class World {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column()
  orderIndex: number;

  @Column({ default: '🍋' })
  iconEmoji: string;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ nullable: true })
  storyTheme: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.world)
  lessons: Lesson[];
}
