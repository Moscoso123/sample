import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class AppService {
  // Simple API response
  getHello(): string {
    return 'Hello from NestJS!';
  }

  // Serve index.html manually if you want to use a controller instead of ServeStaticModule
  getIndexHtml(): string {
    const pathToHtml = join(__dirname, '..', 'public', 'index.html');
    return readFileSync(pathToHtml, { encoding: 'utf-8' });
  }
}
