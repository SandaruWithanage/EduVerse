import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return 'EduVerse API is running';
  }
}
