import { INestApplication } from '@nestjs/common';
import { Keypair } from '@stellar/stellar-sdk';
import axios from 'axios';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as path from 'path';
import * as request from 'supertest';

import { IAccessTokenPayload } from '@/common/cognito/application/interface/access_token_payload.interface';
import { SOROBAN_SERVER } from '@/common/stellar_service/application/domain/soroban.enum';

import { JWT_AUTOMATED_TESTS_SECRET } from './test.constants';

export function createAccessToken(payload: Partial<IAccessTokenPayload>) {
  return jwt.sign(payload, JWT_AUTOMATED_TESTS_SECRET);
}

export type Primitive = string | number | boolean;
export type NestedObject = Record<
  string,
  Primitive | Record<string, Primitive>
>;
export type DataObject = Record<
  string,
  Primitive | NestedObject | Primitive[] | NestedObject[]
>;

export type FilesObject = Record<
  string,
  fs.ReadStream | fs.ReadStream[] | Buffer | Buffer[]
>;

export async function makeRequest({
  method = 'get',
  endpoint,
  data,
  files,
  app,
  content_type = 'application/json',
  authCode,
  query,
}: {
  method?: 'post' | 'put' | 'patch' | 'delete' | 'get';
  endpoint: string;
  app: INestApplication;
  data?: DataObject;
  authCode?: string;
  files?: FilesObject;
  content_type?: 'application/json' | 'multipart/form-data';
  query?: Record<string, string>;
}) {
  try {
    if (!['post', 'put', 'patch', 'delete', 'get'].includes(method)) {
      throw new Error('Invalid method');
    }

    const requestMethods = {
      post: request(app.getHttpServer()).post(endpoint),
      put: request(app.getHttpServer()).put(endpoint),
      patch: request(app.getHttpServer()).patch(endpoint),
      delete: request(app.getHttpServer()).delete(endpoint),
      get: request(app.getHttpServer()).get(endpoint),
    };

    const requestBuilder: request.Test = requestMethods[method];

    if (method === 'get' || method === 'delete') {
      return await requestBuilder
        .query(query)
        ?.auth(authCode, { type: 'bearer' });
    }

    if (content_type === 'application/json' && data) {
      return await requestBuilder
        .send(data)
        ?.auth(authCode, { type: 'bearer' });
    }

    if (data) {
      buildDataFields({ requestBuilder, data });
    }

    if (files) {
      buildFileAttachments({ requestBuilder, files });
    }

    return await requestBuilder
      .set('Content-Type', content_type)
      .query(query)
      ?.auth(authCode, { type: 'bearer' });
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
}

function buildDataFields({
  requestBuilder,
  data,
}: {
  requestBuilder: request.Test;
  data: DataObject | DataObject[];
}): void {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object') {
      buildNestedFields({ requestBuilder, key, value });
    } else {
      requestBuilder.field(key, value);
    }
  }
}

function buildNestedFields({
  requestBuilder,
  key,
  value,
}: {
  requestBuilder: request.Test;
  key: string;
  value: NestedObject;
}): void {
  for (const [subKey, subValue] of Object.entries(value)) {
    if (typeof subValue === 'object') {
      for (const [k, v] of Object.entries(subValue)) {
        requestBuilder.field(`${key}[${subKey}][${k}]`, v);
      }
    } else {
      requestBuilder.field(`${key}[${subKey}]`, subValue);
    }
  }
}

function buildFileAttachments({
  requestBuilder,
  files,
}: {
  requestBuilder: request.Test;
  files: FilesObject;
}): void {
  for (const [key, value] of Object.entries(files)) {
    if (Array.isArray(value)) {
      for (const file of value) {
        requestBuilder.attach(key, file, { filename: key });
      }
      continue;
    }
    requestBuilder.attach(key, value, { filename: key });
  }
}

export function createFileStreams(
  directory: string,
  filenames: string[],
): { [x: string]: fs.ReadStream } {
  return filenames.reduce(
    (files: { [x: string]: fs.ReadStream }, name: string) => {
      files[name] = fs.createReadStream(
        path.join(directory, `toyota-corolla.jpg`),
      );
      return files;
    },
    {},
  );
}

export function createPictureData(categories: string[]): {
  [x: string]: { title: string; description: string };
} {
  return categories.reduce(
    (
      data: { [x: string]: { title: string; description: string } },
      category: string,
    ) => {
      data[category] = {
        title: `${category.charAt(0) + category.slice(1).toLowerCase()} Title`,
        description: `${
          category.charAt(0) + category.slice(1).toLowerCase()
        } Description`,
      };
      return data;
    },
    {},
  );
}

export async function getRandomKeypair() {
  const keypair = Keypair.random();

  const response = await axios.get(
    `${SOROBAN_SERVER.FRIENDBOT_TESNET}${keypair.publicKey()}`,
  );

  if (response) {
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }
}
