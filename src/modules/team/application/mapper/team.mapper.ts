import { Inject, forwardRef } from '@nestjs/common';

import {
  COLLECTION_MAPPER,
  ICollectionMapper,
} from '@/modules/collection/application/interface/collection.mapper.interface';
import {
  IInvitationMapper,
  INVITATION_MAPPER,
} from '@/modules/invitation/application/interface/invitation.mapper.interface';
import {
  IUserRoleToTeamMapper,
  USER_ROLE_TO_TEAM_MAPPER,
} from '@/modules/role/application/interface/role.mapper.interface';

import { Team } from '../../domain/team.domain';
import { TeamResponseDto } from '../dto/response-team.dto';
import { ITeamMapper } from '../interface/team.mapper.interface';
import {
  ITeamData,
  IUpdateTeamData,
} from '../interface/team.service.interface';

export class TeamMapper implements ITeamMapper {
  constructor(
    @Inject(COLLECTION_MAPPER)
    private readonly collectionMapper: ICollectionMapper,
    @Inject(INVITATION_MAPPER)
    private readonly invitationMapper: IInvitationMapper,
    @Inject(forwardRef(() => USER_ROLE_TO_TEAM_MAPPER))
    private readonly userRoleToTeamMapper: IUserRoleToTeamMapper,
  ) {}

  fromDtoToEntity(teamData: ITeamData): Team {
    const { name } = teamData;
    return new Team(name);
  }

  fromUpdateDtoToEntity(teamData: IUpdateTeamData): Team {
    const { name, id } = teamData;
    return new Team(name, id);
  }

  fromEntityToDto(team: Team): TeamResponseDto {
    const { name, id, invitations, collections, userMembers } = team;

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
      id,
      userMembersMapped,
      invitationsMapped,
      collectionsMapped,
    );
  }
}
