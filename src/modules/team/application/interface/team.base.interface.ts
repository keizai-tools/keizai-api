import { User } from '@/modules/user/domain/user.domain';

export interface ITeamData {
  name: string;
  users?: User[];
}

export interface IUpdateTeamData extends ITeamData {
  id: string;
}
