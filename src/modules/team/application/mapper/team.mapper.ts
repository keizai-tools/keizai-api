import { Inject } from '@nestjs/common';

import { CollectionMapper } from '@/modules/collection/application/mapper/collection.mapper';
import { InvitationMapper } from '@/modules/invitation/application/mapper/invitation.mapper';

import { Team } from '../../domain/team.domain';
import { TeamResponseDto } from '../dto/response-team.dto';
import { ITeamData, IUpdateTeamData } from '../service/team.service';

export class TeamMapper {
  constructor(
    @Inject(CollectionMapper)
    private readonly collectionMapper: CollectionMapper,
    @Inject(InvitationMapper)
    private readonly invitationMapper: InvitationMapper,
  ) {}

  fromDtoToEntity(teamData: ITeamData): Team {
    const { name, adminId, users } = teamData;
    return new Team(name, adminId, users);
  }

  fromUpdateDtoToEntity(teamData: IUpdateTeamData): Team {
    const { name, id, adminId, users } = teamData;
    return new Team(name, adminId, users, id);
  }

  fromEntityToDto(team: Team): TeamResponseDto {
    const { name, adminId, id, users, invitations, collections } = team;

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
      users,
      invitationsMapped,
      collectionsMapped,
    );
  }
}
