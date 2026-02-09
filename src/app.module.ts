import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Load environment variables from Railway (no local .env needed)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configure TypeORM to connect to Railway PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'), // Must match Railway variable
        autoLoadEntities: true, // Automatically load entities
        synchronize: true,       // Only for development; set false in production
        ssl: { rejectUnauthorized: false }, // Required for Railway PostgreSQL
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
