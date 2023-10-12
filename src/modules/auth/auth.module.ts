import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { AuthMapper } from './application/mapper/user.mapper';
import { COGNITO_SERVICE } from './application/repository/cognito.interface.service';
import { USER_REPOSITORY } from './application/repository/user.repository.interface';
import { AuthService } from './application/service/auth.service';
import { CognitoService } from './infrastructure/cognito/aws.cognito.service';
import { UserSchema } from './infrastructure/persistence/user.schema';
import { UserRepository } from './infrastructure/persistence/user.typeorm.repository';
import { AuthController } from './interface/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([UserSchema]),
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: COGNITO_SERVICE,
      useClass: CognitoService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    AuthMapper,
  ],
})
export class AuthModule {}
