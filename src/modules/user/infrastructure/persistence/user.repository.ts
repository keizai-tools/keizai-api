import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

import { PaginationDto } from '@/common/base/application/dto/pagination.dto';
import { IFindAllResponse } from '@/common/base/interface/common.interface';

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

  async findAll({
    skip = 0,
    take = 20,
  }: PaginationDto): Promise<IFindAllResponse<User>> {
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take,
      cache: true,
    });

    return { data: users, total, take, skip };
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
}
