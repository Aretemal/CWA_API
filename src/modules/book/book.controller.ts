import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Request,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Book } from '@prisma/client';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import * as fs from 'fs/promises';

import { BookService } from './book.service';
interface BookSummary {
  id: number;
  title: string;
  author: string;
  uniqueIdentifier: string;
}
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('/create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'files', 'books'), // Путь к папке для сохранения файлов
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}-${file.originalname}`;
          cb(null, uniqueName); // Уникальное имя файла
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBookDto: { title: string; author: string },
    @Request() req,
  ): Promise<Book> {
    // const userId = req.user.id; // Получаем ID пользователя из запроса
    const uniqueIdentifier = uuidv4(); // Генерация уникального идентификатора
    return this.bookService.createBook({
      ...createBookDto,
      userId: 1,
      uniqueIdentifier,
      filePath: file.path,
    }); // Передаем данные в сервис
  }

  @Get('/read/:id')
  async getBook(@Param('id') id: string, @Res() res: Response) {
    const book = await this.bookService.getBookById(id);
    if (!book) {
      return res.status(404).send('Book not found');
    }
    // Отправляем файл пользователю
    // return res.sendFile(book.filePath); // Убедитесь, что путь к файлу корректен
    // return res.json({
    //   file: book.filePath, // Убедитесь, что путь к файлу корректен
    // });
    const filePath = book.filePath; // Убедитесь, что это абсолютный путь
    console.log('File path:', filePath); // Логируем путь к файлу

    try {
      await fs.access(filePath); // Проверяем доступность файла
      const fileContents = await fs.readFile(filePath); // Читаем файл в бинарном виде
      const base64File = fileContents.toString('base64'); // Конвертируем в Base64
      return res.json({ file: base64File }); // Отправляем в формате Base64
    } catch (error) {
      console.error('Error reading file:', error); // Логируем ошибку
      return res.status(500).send('Error reading file');
    }
  }

  @Get('/all')
  async getAllBooks(): Promise<{ data: BookSummary[] }> {
    const books = await this.bookService.getAllBooks(); // Получаем все книги

    return { data: books };
  }
}
