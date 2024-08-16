import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResilienceModule } from 'nestjs-resilience';
import { DataSource } from 'typeorm';

import { configuration } from '@configuration/configuration';
import { configurationValidate } from '@configuration/configuration.validate';
import { datasourceOptions } from '@configuration/orm.configuration';

import { CommonModule } from '@common/common.module';

import { AuthenticationModule } from './modules/auth/authentication.module';
import { BlockchainNetworkStatusModule } from './modules/blockchainNetworkStatus/blockchainNetworkStatus.module';
import { CollectionModule } from './modules/collection/collection.module';
import { EnviromentModule } from './modules/enviroment/enviroment.module';
import { FolderModule } from './modules/folder/folder.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { InvocationModule } from './modules/invocation/invocation.module';
import { MethodModule } from './modules/method/method.module';
import { UserRoleToTeamModule } from './modules/role/role.module';
import { TeamModule } from './modules/team/team.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: configurationValidate,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...datasourceOptions,
        autoLoadEntities: true,
      }),
      dataSourceFactory: async (options) => {
        return new DataSource(options).initialize();
      },
    }),
    ResilienceModule.forRoot({}),
    CommonModule,
    AuthenticationModule,
    CollectionModule,
    EnviromentModule,
    FolderModule,
    InvitationModule,
    InvocationModule,
    MethodModule,
    UserRoleToTeamModule,
    TeamModule,
    UserModule,
    BlockchainNetworkStatusModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
