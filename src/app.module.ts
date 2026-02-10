// app.module.ts - FINAL VERSION
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
      // Use the NEW user you created
      host: 'mysql.railway.internal',
      port: 3306,
      username: 'app_user', // ← The user YOU created
      password: 'StrongPass123!', // ← The password YOU set
      database: 'railway',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // false in production
      ssl: false, // Internal doesn't need SSL
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