import { Injectable, NotFoundException } from '@nestjs/common';
import { Book } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

import { PrismaService } from '../prisma.service';
interface BookSummary {
  id: number;
  title: string;
  author: string;
  uniqueIdentifier: string;
}
@Injectable()
export class BookService {
  private readonly booksDirectory = path.join(__dirname, '..', '..', 'books');

  constructor(private prisma: PrismaService) {
    // Создаем папку для книг, если она не существует
    if (!fs.existsSync(this.booksDirectory)) {
      fs.mkdirSync(this.booksDirectory);
    }
  }

  async createBook(data: {
    title: string;
    author: string;
    userId: number; // ID пользователя, который создает книгу
    uniqueIdentifier: string;
    filePath: string;
  }): Promise<Book> {
    // Создаем новую книгу в базе данных
    return this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        userId: data.userId,
        uniqueIdentifier: data.uniqueIdentifier,
        filePath: data.filePath,
      },
    });
  }

  async getBookById(id: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({
      where: { id: parseInt(id) },
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async getAllBooks(): Promise<BookSummary[]> {
    return this.prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        uniqueIdentifier: true,
        // Убедитесь, что другие поля, такие как filePath, не включены
      },
    });
  }
}
