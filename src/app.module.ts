// app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL); // DEBUG: remove after confirmed

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.MYSQL_PUBLIC_URL, // Railway full DB connection string
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // false in production
      ssl: false, // Railway internal connection does not require SSL
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
