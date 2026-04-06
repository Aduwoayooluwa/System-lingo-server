import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { UserBadge } from './user-badge.entity';

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  iconUrl: string;

  @Column({ default: '🏆' })
  iconEmoji: string;

  @Column('jsonb', { nullable: true })
  criteria: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];
}
