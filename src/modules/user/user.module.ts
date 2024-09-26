import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonModule } from '@/common/common.module';

import { USER_MAPPER } from './application/interfaces/user.mapper.interfaces';
import { USER_REPOSITORY } from './application/interfaces/user.repository.interfaces';
import { USER_SERVICE } from './application/interfaces/user.service.interfaces';
import { UserMapper } from './application/mapper/user.mapper';
import { UserService } from './application/service/user.service';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { UserSchema } from './infrastructure/persistence/user.schema';
import { UserController } from './interface/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSchema]),
    forwardRef(() => CommonModule),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
    {
      provide: USER_MAPPER,
      useClass: UserMapper,
    },
  ],
  exports: [
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
    {
      provide: USER_MAPPER,
      useClass: UserMapper,
    },
  ],
  controllers: [UserController],
})
export class UserModule {}
