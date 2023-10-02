import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '@/app.module';
import { AUTHOR_REPOSITORY } from '@/modules/author/application/repository/author.repository';

import { BOOK_REPOSITORY } from '../../application/repository/book.repository';
import { BookController } from '../book.controller';

const mockedAuthorRepository = {
  create: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

const mockedBookRepository = {
  create: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

describe('BookController', () => {
  let controller: BookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BOOK_REPOSITORY)
      .useValue(mockedBookRepository)
      .overrideProvider(AUTHOR_REPOSITORY)
      .useValue(mockedAuthorRepository)
      .compile();

    controller = module.get<BookController>(BookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
