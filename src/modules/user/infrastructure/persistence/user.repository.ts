import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

import { IUpdateUserResponse } from '../../application/interfaces/user.common.interfaces';
import { IUserRepository } from '../../application/interfaces/user.repository.interfaces';
import { User } from '../../domain/user.domain';
import { UserSchema } from './user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async update(id: string, user: Partial<User>): Promise<IUpdateUserResponse> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldUser = await this.findById(id);
      await queryRunner.manager.save(User, { id, ...user });
      await queryRunner.commitTransaction();
      const updatedUser = await this.findById(id);
      return { oldUser, newUser: updatedUser };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.userRepository.delete({ id });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      cache: true,
    });
  }

  async saveOne(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async findByExternalId(externalId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { externalId },
      cache: true,
    });
  }

  async findById(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      cache: true,
    });
  }

  async findAllByEmails(emails: string[]): Promise<User[]> {
    return await this.userRepository.find({
      where: { email: In(emails) },
      cache: true,
    });
  }

  async findByMemoId(memoId: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { memoId: parseInt(memoId) },
        cache: true,
      });
      return user;
    } catch (error) {
      console.error('Error finding user by memoId:', error);
      throw new Error('Could not find user with provided memoId.');
    }
  }
}
