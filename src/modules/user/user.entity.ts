import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = []; // Здесь вы можете использовать Prisma или другую ORM

  create(user: any) {
    this.users.push(user); // Сохранение пользователя
    return user;
  }

  findAll() {
    return this.users; // Возвращаем всех пользователей
  }
}
