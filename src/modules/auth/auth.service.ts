import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client'; // Импортируйте модель User
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service'; // Импортируйте UserService

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.userService.validatePassword(user, password))) {
      return user;
    }
    return null;
  }

  async login(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.userService.create({ ...userData, password: hashedPassword });
  }
}
