import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { Public } from '@prisma/client/runtime/library';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') // Новый маршрут для регистрации
  async register(
    @Body() userData: { name: string; email: string; password: string },
  ) {
    const newUser = await this.authService.register(userData);
    return {
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
