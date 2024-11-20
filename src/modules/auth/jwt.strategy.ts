import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from './jwt.payload'; // Создадим интерфейс для полезной нагрузки
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your_secret_key',
    });
  }

  async validate(payload: JwtPayload) {
    console.log(payload);
    const user = await this.userService.findById(payload.sub); // Метод для поиска пользователя по ID
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // Возвращаем пользователя
  }
}
