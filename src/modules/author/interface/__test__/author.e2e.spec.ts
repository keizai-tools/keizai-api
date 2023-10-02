import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { join } from 'path';
import * as request from 'supertest';

import { loadFixtures } from '@data/util/loader';

import { AppModule } from '@/app.module';

import { Status } from '../../domain/status.enum';

describe('Author - [/author]', () => {
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

  describe('Get all - [GET /author]', () => {
    it('should return an array of authors', async () => {
      return request(app.getHttpServer())
        .get('/author')
        .expect(HttpStatus.OK)
        .then(({ body }) => {
          const expectedAuthors = expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              status: Status.ACTIVE,
              password: '123456',
              updatedAt: expect.any(String),
              createdAt: expect.any(String),
            }),
            expect.objectContaining({
              id: 2,
              firstName: 'Jane',
              lastName: 'Doe',
              status: Status.INACTIVE,
              password: '654321',
              updatedAt: expect.any(String),
              createdAt: expect.any(String),
            }),
          ]);

          expect(body).toEqual(expectedAuthors);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
