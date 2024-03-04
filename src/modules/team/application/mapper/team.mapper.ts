import { Inject } from '@nestjs/common';

import { CollectionMapper } from '@/modules/collection/application/mapper/collection.mapper';
import { InvitationMapper } from '@/modules/invitation/application/mapper/invitation.mapper';
import { UserRoleToTeamMapper } from '@/modules/role/application/mapper/role.mapper';

import { Team } from '../../domain/team.domain';
import { TeamResponseDto } from '../dto/response-team.dto';
import { ITeamData, IUpdateTeamData } from '../service/team.service';

export class TeamMapper {
  constructor(
    @Inject(CollectionMapper)
    private readonly collectionMapper: CollectionMapper,
    @Inject(InvitationMapper)
    private readonly invitationMapper: InvitationMapper,
    @Inject(UserRoleToTeamMapper)
    private readonly userRoleToTeamMapper: UserRoleToTeamMapper,
  ) {}

  fromDtoToEntity(teamData: ITeamData): Team {
    const { name, adminId } = teamData;
    return new Team(name, adminId);
  }

  fromUpdateDtoToEntity(teamData: IUpdateTeamData): Team {
    const { name, id, adminId } = teamData;
    return new Team(name, adminId, id);
  }

  fromEntityToDto(team: Team): TeamResponseDto {
    const { name, adminId, id, invitations, collections, userMembers } = team;

    const userMembersMapped = userMembers?.map((userMember) => {
      return this.userRoleToTeamMapper.fromEntityToDto(userMember);
    });

    const collectionsMapped = collections?.map((collection) => {
      return this.collectionMapper.fromEntityToDto(collection);
    });

    const invitationsMapped = invitations?.map((invitation) => {
      return this.invitationMapper.fromEntityToDto(invitation);
    });

    return new TeamResponseDto(
      name,
      adminId,
      id,
      userMembersMapped,
      invitationsMapped,
      collectionsMapped,
    );
  }
}
