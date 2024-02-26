import { IBaseRepository } from '@/common/application/base.repository';

import { Invitation } from '../../domain/invitation.domain';

export interface IInvitationRepository extends IBaseRepository<Invitation> {
  findAllByUserId(userId: string): Promise<Invitation[]>;
  update(invitation: Invitation): Promise<Invitation>;
  delete(id: string): Promise<boolean>;
  saveAll(invitations: Invitation[]): Promise<Invitation[]>;
}

export const INVITATION_REPOSITORY = 'INVITATION_REPOSITORY';
