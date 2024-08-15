import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { IResponse } from '@/common/response_service/interface/response.interface';
import { Role } from '@/modules/authorization/domain/role.enum';
import { TeamService } from '@/modules/team/application/service/team.service';
import { User } from '@/modules/user/domain/user.domain';

import { AUTH_RESPONSE } from '../exceptions/auth-error';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly teamService: TeamService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { teamId } = req.params;

    const { payload: team } = await this.teamService.findOne(teamId);

    const userReq: IResponse<User> = req.user;

    const isMemberOfATeam = team.userMembers.some(
      (member) => member.userId === userReq.payload.id,
    );

    if (!isMemberOfATeam) {
      throw new UnauthorizedException(AUTH_RESPONSE.USER_NOT_MEMBER_TEAM);
    }

    const userMember = team.userMembers.find(
      (user) => user.userId === userReq.payload.id,
    );

    if (userMember.role === Role.OWNER || userMember.role === Role.ADMIN) {
      return true;
    }

    throw new UnauthorizedException(AUTH_RESPONSE.USER_ROLE_NOT_AUTHORIZED);
  }
}
