import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { TeamService } from '@/modules/team/application/service/team.service';

import { AUTH_RESPONSE } from '../../application/exceptions/auth-error';
import { Role } from '../../domain/role.enum';

@Injectable()
export class AdminRoleGuard implements CanActivate {
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

    const userMember = team.userMembers.find(
      (user) => user.userId === req.user.id,
    );

    if (userMember.role === Role.OWNER || userMember.role === Role.ADMIN) {
      return true;
    }

    throw new UnauthorizedException(AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED);
  }
}
