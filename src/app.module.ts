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
        const nodeEnv = config.get('NODE_ENV') || 'production';
        console.log('=== CONFIG DEBUG ===');
        console.log('NODE_ENV:', nodeEnv);
        console.log('MYSQLPASSWORD exists?:', !!process.env.MYSQLPASSWORD);
        console.log('All MySQL env vars:', {
          MYSQLHOST: process.env.MYSQLHOST,
          MYSQLPORT: process.env.MYSQLPORT,
          MYSQLUSER: process.env.MYSQLUSER,
          MYSQLPASSWORD: process.env.MYSQLPASSWORD ? 'SET' : 'NOT SET',
          MYSQLDATABASE: process.env.MYSQLDATABASE,
        });
        console.log('====================');
        
        // For Railway Production - Use ALL credentials from environment
        return {
          type: 'mysql',
          // Use EXACTLY what Railway provides
          host: process.env.MYSQLHOST || 'mysql.railway.internal',
          port: parseInt(process.env.MYSQLPORT || '3306'),
          username: process.env.MYSQLUSER || 'root',
          password: process.env.MYSQLPASSWORD || '', // THIS MUST BE SET!
          database: process.env.MYSQLDATABASE || 'railway',
          autoLoadEntities: true,
          synchronize: nodeEnv !== 'production', // false for production
          ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
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