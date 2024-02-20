import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

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

  async findOne(id: string): Promise<User> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByexternalId(id: string): Promise<User> {
    return await this.repository.findOne({
      where: {
        externalId: id,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.repository.findOne({
      where: {
        email,
      },
    });
  }

  async findAllByEmails(emails: string[]): Promise<User[]> {
    return this.repository.find({ where: { email: In(emails) } });
  }
}
