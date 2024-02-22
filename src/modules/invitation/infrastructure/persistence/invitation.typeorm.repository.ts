import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IInvitationRepository } from '../../application/repository/invitation.repository';
import { Invitation } from '../../domain/invitation.domain';
import { InvitationSchema } from './invitation.schema';

@Injectable()
export class InvitationRepository implements IInvitationRepository {
  constructor(
    @InjectRepository(InvitationSchema)
    private readonly repository: Repository<Invitation>,
  ) {}

  async findAllByUserId(userId: string): Promise<Invitation[]> {
    return await this.repository.find({
      relations: { fromUser: true, toUser: true },
      where: {
        toUserId: userId,
      },
    });
  }

  async findOne(id: string): Promise<Invitation> {
    return await this.repository.findOne({
      relations: { fromUser: true, toUser: true },
      where: {
        id,
      },
    });
  }

  async save(invitation: Invitation): Promise<Invitation> {
    return this.repository.save(invitation);
  }

  async update(invitation: Invitation): Promise<Invitation> {
    return await this.repository.preload(invitation);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.findOne(id);
    if (result) {
      await this.repository.delete(id);
      return true;
    }
    return false;
  }
}
