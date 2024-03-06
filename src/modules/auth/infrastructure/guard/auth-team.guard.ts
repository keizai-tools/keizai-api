import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { TeamService } from '@/modules/team/application/service/team.service';

import { AUTH_RESPONSE } from '../../application/exceptions/auth-error';

@Injectable()
export class AuthTeamGuard implements CanActivate {
  constructor(private readonly teamService: TeamService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { teamId } = req.params;

    const team = await this.teamService.findOne(teamId);

    const isMemberOfATeam = team.userMembers.some(
      (member) => member.userId === req.user.id,
    );

    if (!isMemberOfATeam) {
      throw new UnauthorizedException(AUTH_RESPONSE.USER_NOT_MEMBER_TEAM);
    }

    return true;
  }
}
