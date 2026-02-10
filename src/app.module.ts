import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get('NODE_ENV');
        console.log(`NODE_ENV: ${nodeEnv}`);
        
        // OPTION 1: Try INTERNAL Railway network (MOST RELIABLE)
        if (nodeEnv === 'production') {
          return {
            type: 'mysql',
            host: 'mysql.railway.internal', // ← INTERNAL hostname
            port: 3306, // ← DEFAULT MySQL port
            username: config.get('MYSQLUSER') || 'root',
            password: config.get('MYSQLPASSWORD'),
            database: config.get('MYSQLDATABASE') || 'railway',
            autoLoadEntities: true,
            synchronize: false, // ← FALSE for production
            ssl: false, // ← NO SSL for internal
            extra: {
              connectionLimit: 10,
            },
          };
        }
        
        // OPTION 2: Use Railway's provided variables (Public)
        const mysqlHost = config.get('MYSQLHOST');
        if (mysqlHost && mysqlHost.includes('railway.app')) {
          return {
            type: 'mysql',
            host: mysqlHost,
            port: config.get('MYSQLPORT') || 3306,
            username: config.get('MYSQLUSER') || 'root',
            password: config.get('MYSQLPASSWORD'),
            database: config.get('MYSQLDATABASE') || 'railway',
            autoLoadEntities: true,
            synchronize: false,
            ssl: { rejectUnauthorized: false }, // ← SSL for public
            extra: {
              ssl: { rejectUnauthorized: false },
              connectionLimit: 10,
            },
          };
        }
        
        // OPTION 3: Local development
        return {
          type: 'mysql',
          host: 'localhost',
          port: 3306,
          username: 'root',
          password: 'iqFsnTTsFJGzvQbsqeHkOJszMWBbpLLD',
          database: 'test',
          autoLoadEntities: true,
          synchronize: true,
          ssl: false,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}