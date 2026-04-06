import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { WorldsModule } from './worlds/worlds.module';
import { ProgressModule } from './progress/progress.module';
import { SimulationModule } from './simulation/simulation.module';
import { SeedModule } from './seed/seed.module';
import { User } from './entities/user.entity';
import { World } from './entities/world.entity';
import { Lesson } from './entities/lesson.entity';
import { UserProgress } from './entities/user-progress.entity';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useSsl = config.get<string>('DATABASE_SSL') === 'true';

        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          entities: [User, World, Lesson, UserProgress, Badge, UserBadge],
          synchronize: true,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    WorldsModule,
    ProgressModule,
    SimulationModule,
    SeedModule,
  ],
})
export class AppModule {}
