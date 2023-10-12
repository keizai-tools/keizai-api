import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@common/common.module';

import { AuthorMysqlRepository } from '@modules/author/infrastructure/persistence/author.mysql.repository';
import { AuthorSchema } from '@modules/author/infrastructure/persistence/author.schema';

import { BookModule } from '../book/book.module';
import { AuthorMapper } from './application/mapper/author.mapper';
import { AUTHOR_REPOSITORY } from './application/repository/author.repository';
import { AuthorService } from './application/service/author.service';
import { AuthorController } from './interface/author.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuthorSchema]), CommonModule, BookModule],
  controllers: [AuthorController],
  providers: [
    AuthorService,
    AuthorMapper,

    {
      provide: AUTHOR_REPOSITORY,
      useClass: AuthorMysqlRepository,
    },
  ],
  exports: [
    AuthorService,
    AuthorMapper,
    {
      provide: AUTHOR_REPOSITORY,
      useClass: AuthorMysqlRepository,
    },
  ],
})
export class AuthorModule {}
