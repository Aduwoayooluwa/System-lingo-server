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
import { Badge } from './badge.entity';

@Entity('user_badges')
@Unique(['userId', 'badgeId'])
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.badges)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  badgeId: string;

  @ManyToOne(() => Badge, (badge) => badge.userBadges)
  @JoinColumn({ name: 'badgeId' })
  badge: Badge;

  @CreateDateColumn()
  earnedAt: Date;
}
