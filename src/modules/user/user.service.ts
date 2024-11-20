import { Injectable } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  async create(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // user.service.ts

  async getUserInfo(
    id: number,
  ): Promise<{ name: string; email: string } | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true }, // Выбираем только имя и email
    });
    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password); // Используйте bcrypt для сравнения
  }
}
