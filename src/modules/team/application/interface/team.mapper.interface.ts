import { Team } from '../../domain/team.domain';
import { TeamResponseDto } from '../dto/response-team.dto';
import { ITeamData, IUpdateTeamData } from './team.service.interface';

export const TEAM_MAPPER = 'TEAM_MAPPER';

export interface ITeamMapper {
  fromDtoToEntity(teamData: ITeamData): Team;
  fromUpdateDtoToEntity(teamData: IUpdateTeamData): Team;
  fromEntityToDto(team: Team): TeamResponseDto;
}
