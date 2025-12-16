import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  async hash(plain: string) {
    const saltRounds = 10;
    return bcrypt.hash(plain, saltRounds);
  }
}
