import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      // DEBUG: Show what we're trying to connect to
      host: process.env.MYSQLHOST || 'mysql.railway.internal',
      port: parseInt(process.env.MYSQLPORT || '3306'),
      username: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQLPASSWORD || '', // ← THIS IS THE PROBLEM!
      database: process.env.MYSQLDATABASE || 'railway',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
      extra: {
        connectionLimit: 10,
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