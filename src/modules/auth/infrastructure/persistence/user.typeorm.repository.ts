import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IUserRepository } from '../../application/repository/user.repository.interface';
import { User } from '../../domain/user.domain';
import { UserSchema } from './user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    return await this.repository.save(user);
  }

  async findOne(id: number): Promise<User> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByExternalId(id: string): Promise<User> {
    return await this.repository.findOne({
      where: {
        externalId: id,
      },
    });
  }
}
