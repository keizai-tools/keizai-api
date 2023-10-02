import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@common/common.module';

import { AuthorModule } from '@modules/author/author.module';
import { BookSchema } from '@modules/book/infrastructure/persistence/book.schema';

import { BookMapper } from './application/mapper/book.mapper';
import { BOOK_REPOSITORY } from './application/repository/book.repository';
import { BookService } from './application/service/book.service';
import { BookTypeORMRepository } from './infrastructure/persistence/book.typeorm.repository';
import { BookController } from './interface/book.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookSchema]),
    forwardRef(() => AuthorModule),
    CommonModule,
  ],
  controllers: [BookController],
  providers: [
    BookService,
    BookMapper,
    {
      provide: BOOK_REPOSITORY,
      useClass: BookTypeORMRepository,
    },
  ],
  exports: [
    BookService,
    BookMapper,
    {
      provide: BOOK_REPOSITORY,
      useClass: BookTypeORMRepository,
    },
  ],
})
export class BookModule {}
