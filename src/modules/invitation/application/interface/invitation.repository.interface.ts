import { Invitation } from '../../domain/invitation.domain';

export const INVITATION_REPOSITORY = 'INVITATION_REPOSITORY';

export interface IInvitationRepository {
  findOne(id: string): Promise<Invitation>;
  save(invitation: Invitation): Promise<Invitation>;
  findAllByUserId(userId: string): Promise<Invitation[]>;
  update(invitation: Invitation): Promise<Invitation>;
  delete(id: string): Promise<boolean>;
  saveAll(invitations: Invitation[]): Promise<Invitation[]>;
}
