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
        // Debug: Check what Railway is providing
        console.log('=== MySQL Configuration ===');
        console.log('MYSQLHOST:', config.get('MYSQLHOST'));
        console.log('MYSQLPORT:', config.get('MYSQLPORT'));
        console.log('MYSQLUSER:', config.get('MYSQLUSER'));
        console.log('MYSQLDATABASE:', config.get('MYSQLDATABASE'));
        console.log('NODE_ENV:', config.get('NODE_ENV'));
        console.log('==========================');

        // Try DATABASE_URL if MYSQLHOST doesn't work
        const databaseUrl = config.get('DATABASE_URL');
        if (databaseUrl && databaseUrl.includes('mysql://')) {
          try {
            // Parse MySQL URL format: mysql://user:pass@host:port/db
            const url = new URL(databaseUrl);
            return {
              type: 'mysql',
              host: url.hostname,
              port: parseInt(url.port) || 3306,
              username: decodeURIComponent(url.username),
              password: decodeURIComponent(url.password),
              database: url.pathname.substring(1),
              autoLoadEntities: true,
              synchronize: config.get('NODE_ENV') !== 'production',
              ssl: { rejectUnauthorized: false },
              extra: {
                connectionLimit: 10,
                connectTimeout: 60000,
              },
            };
          } catch (error) {
            console.error('Failed to parse DATABASE_URL:', error);
          }
        }

        // Default: Use Railway's standard MySQL variables
        return {
          type: 'mysql',
          host: config.get('MYSQLHOST') || 'localhost',
          port: config.get('MYSQLPORT') || 3306,
          username: config.get('MYSQLUSER') || 'root',
          password: config.get('MYSQLPASSWORD') || '',
          database: config.get('MYSQLDATABASE') || 'railway',
          autoLoadEntities: true,
          synchronize: config.get('NODE_ENV') !== 'production',
          // Railway MySQL requires SSL for public connections
          ssl: config.get('NODE_ENV') === 'production' 
            ? { rejectUnauthorized: false } 
            : false,
          extra: {
            connectionLimit: 10,
            connectTimeout: 60000,
          },
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