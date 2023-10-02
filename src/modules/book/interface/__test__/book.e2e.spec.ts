import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';
import { Status } from '@/modules/author/domain/status.enum';

import { CreateBookDto } from '../../application/dto/request/create-book.dto';
import { BookError } from '../../application/exceptions/book.errors.enum';
import { Format } from '../../domain/format.enum';

describe('Book - [/book]', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await loadFixtures(
      `${__dirname}/fixture`,
      join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'configuration/orm.configuration.ts',
      ),
    );

    app = moduleRef.createNestApplication();

    await app.init();
  });

  describe('Get all - [GET /book]', () => {
    it('should return an array of books', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/book')
        .expect(HttpStatus.OK);

      const expectedBooks = expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          title: 'Title one',
          format: Format.DIGITAL,
          author: expect.objectContaining({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            status: Status.ACTIVE,
            password: '123456',
            updatedAt: expect.any(String),
            createdAt: expect.any(String),
          }),
        }),
      ]);

      expect(body.data).toEqual(expectedBooks);
      expect(body.data).toHaveLength(2);
    });
  });

  describe('Create - [POST /book]', () => {
    it('should create a book', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Title two',
        format: Format.POCKET,
        author: 1,
      };

      const { body } = await request(app.getHttpServer())
        .post('/book')
        .send(createBookDto)
        .expect(HttpStatus.CREATED);

      const expectedBooks = expect.objectContaining({
        id: 3,
        title: 'Title two',
        format: Format.POCKET,
        updatedAt: expect.any(String),
        createdAt: expect.any(String),
        author: expect.objectContaining({
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          status: Status.ACTIVE,
          password: '123456',
          updatedAt: expect.any(String),
          createdAt: expect.any(String),
        }),
      });
      expect(body).toEqual(expectedBooks);
    });
  });

  describe('Get - [GET /book/:id]', () => {
    it('should return an error if book is not found', async () => {
      const BOOK_ID = 999;

      const { body } = await request(app.getHttpServer())
        .get(`/book/${BOOK_ID}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(body).toEqual({
        error: 'Not Found',
        message: BookError.NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  it('should successfully delete a book', async () => {
    const BOOK_ID = 1;

    const { body } = await request(app.getHttpServer())
      .delete(`/book/${BOOK_ID}`)
      .expect(HttpStatus.OK);

    expect(body).toEqual({});
  });

  describe('Update - [PUT /book/:id]', () => {
    it('should update a book', async () => {
      const BOOK_TO_UPDATE_ID = 2;
      const updateBookDto: CreateBookDto = {
        title: 'Title two modified',
        format: Format.DIGITAL,
        author: 1,
      };

      const { body } = await request(app.getHttpServer())
        .post(`/book/${BOOK_TO_UPDATE_ID}`)
        .send(updateBookDto)
        .expect(HttpStatus.ACCEPTED);

      expect(body).toEqual({
        format: Format.DIGITAL,
        id: 2,
        title: 'Title two modified',
        updatedAt: expect.any(String),
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
