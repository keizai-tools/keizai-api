import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { IUserResponse } from '@/modules/auth/infrastructure/decorators/auth.decorators';
import { Collection } from '@/modules/collection/domain/collection.domain';
import { CollectionRepository } from '@/modules/collection/infrastructure/persistence/collection.typeorm.repository';

import { CollectionResponseDto } from '../../dto/collection-response.dto';
import { CreateCollectionDto } from '../../dto/create-collection.dto';
import { UpdateCollectionDto } from '../../dto/update-collection.dto';
import { COLLECTION_RESPONSE } from '../../exceptions/collection-response.enum';
import { CollectionMapper } from '../../mapper/collection.mapper';
import { COLLECTION_REPOSITORY } from '../../repository/collection.repository';
import { CollectionService } from '../collection.service';

const collection: Collection = { name: 'test', userId: '1' };
const collectionResponseDto: CollectionResponseDto = {
  id: '1',
  name: '',
  folders: [],
  enviroments: [],
};

const mockCollectionRepository = {
  findAllByUser: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  findOneByIds: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockCollectionMapper = {
  fromDtoToEntity: jest.fn(() => collection),
  fromUpdateDtoToEntity: jest.fn(() => collectionResponseDto),
  fromEntityToDto: jest.fn(() => collectionResponseDto),
};

describe('CollectionService', () => {
  let collectionService: CollectionService;
  let collectionRepository: CollectionRepository;

  const user: IUserResponse = {
    username: 'test',
    externalId: 'test',
    id: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: CollectionMapper,
          useValue: mockCollectionMapper,
        },
        {
          provide: COLLECTION_REPOSITORY,
          useValue: mockCollectionRepository,
        },
      ],
    }).compile();

    collectionService = module.get<CollectionService>(CollectionService);
    collectionRepository = module.get<CollectionRepository>(
      COLLECTION_REPOSITORY,
    );
  });

  describe('All collections - [findAllByUser]', () => {
    const collections: Collection[] = [];
    it('Should show all collections by user', async () => {
      mockCollectionRepository.findAllByUser.mockResolvedValue(collections);
      const result = await collectionService.findAllByUser('1');

      expect(collectionRepository.findAllByUser).toHaveBeenCalledWith('1');
      expect(collectionRepository.findAllByUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(collections);
    });
    it('Should show an error message with collections not found', async () => {
      mockCollectionRepository.findAllByUser.mockResolvedValue(null);
      try {
        await collectionService.findAllByUser('1');
      } catch (error) {
        expect(error instanceof NotFoundException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTIONS_NOT_FOUND,
        );
      }
    });
  });
  describe('Find a collection - [findOne]', () => {
    it('Should show a collection', async () => {
      mockCollectionRepository.findOne.mockResolvedValue(collection);
      const result = await collectionService.findOne('1');

      expect(collectionRepository.findOne).toHaveBeenCalledWith('1');
      expect(collectionRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(collectionResponseDto);
    });
    it('Should show an error message with collection not found', async () => {
      mockCollectionRepository.findOne.mockResolvedValue(null);
      try {
        await collectionService.findOne('1');
      } catch (error) {
        expect(error instanceof NotFoundException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_ID,
        );
      }
    });
  });
  describe('Find collection by user and id - [findOneByIds]', () => {
    const id = '1';
    const userId = '1';
    it('Should show a collection by user and id', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(collection);
      const result = await collectionService.findOneByIds(id, userId);

      expect(collectionRepository.findOneByIds).toHaveBeenCalledWith(
        id,
        userId,
      );
      expect(collectionRepository.findOneByIds).toHaveBeenCalledTimes(1);
      expect(result).toEqual(collectionResponseDto);
    });
    it('Should show an error message with collection not found', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(null);
      try {
        await collectionService.findOneByIds(id, userId);
      } catch (error) {
        expect(error instanceof NotFoundException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }
    });
  });
  describe('Create a collection - [create]', () => {
    const collectionDto = new CreateCollectionDto();
    it('Should create and save a collection', async () => {
      mockCollectionRepository.save.mockResolvedValue(collectionDto);
      const result = await collectionService.create(collectionDto, user);

      expect(collectionRepository.save).toHaveBeenCalledWith(collection);
      expect(collectionRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(collectionResponseDto);
    });
    it('Should show an error message with failed to save a collection', async () => {
      mockCollectionRepository.save.mockResolvedValue(null);
      try {
        await collectionService.create(collectionDto, user);
      } catch (error) {
        expect(error instanceof BadRequestException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_FAILED_SAVE,
        );
      }
    });
  });
  describe('Update a collection - [update]', () => {
    const collectionDto = new UpdateCollectionDto();
    const userId = '1';

    it('Should update and save a collection', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(collection);
      mockCollectionRepository.update.mockResolvedValue(collectionDto);
      mockCollectionRepository.save.mockResolvedValue(collectionDto);

      const result = await collectionService.update(collectionDto, userId);

      expect(collectionRepository.update).toHaveBeenCalledWith(
        collectionResponseDto,
      );
      expect(collectionRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(collectionResponseDto);
    });
    it('Should show an error message with collection not found', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(null);
      try {
        await collectionService.update(collectionDto, userId);
      } catch (error) {
        expect(error instanceof NotFoundException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }
    });
    it('Should show an error message with failed to update a collection', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(collection);
      mockCollectionRepository.update.mockResolvedValue(null);
      try {
        await collectionService.update(collectionDto, userId);
      } catch (error) {
        expect(error instanceof BadRequestException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_FAILED_UPDATED,
        );
      }
    });
    it('Should show an error message with failed to save a collection', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(collection);
      mockCollectionRepository.update.mockResolvedValue(collectionDto);
      mockCollectionRepository.save.mockResolvedValue(null);
      try {
        await collectionService.update(collectionDto, userId);
      } catch (error) {
        expect(error instanceof BadRequestException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_FAILED_SAVE,
        );
      }
    });
  });
  describe('Delete a collection - [delete]', () => {
    const id = '1';
    const userId = '1';
    it('Should delete a collection succesfully', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(collection);
      mockCollectionRepository.delete.mockResolvedValue(true);

      const result = await collectionService.delete(id, userId);

      expect(collectionRepository.delete).toHaveBeenCalledWith('1');
      expect(collectionRepository.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(true);
    });
    it('Should show an error message with collection not found', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(null);
      try {
        await collectionService.delete(id, userId);
      } catch (error) {
        expect(error instanceof NotFoundException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_NOT_FOUND_BY_USER_AND_ID,
        );
      }
    });
    it('Should show an error message with failed to delete a collection', async () => {
      mockCollectionRepository.findOneByIds.mockResolvedValue(collection);
      mockCollectionRepository.delete.mockResolvedValue(null);
      try {
        await collectionService.delete(id, userId);
      } catch (error) {
        expect(error instanceof BadRequestException).toBe(true);
        expect(error.message).toEqual(
          COLLECTION_RESPONSE.COLLECTION_FAILED_DELETED,
        );
      }
    });
  });
});
