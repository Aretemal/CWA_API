import { Module } from '@nestjs/common';

import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookModule } from './modules/book/book.module';

@Module({
  imports: [UserModule, AuthModule, BookModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
