import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { ResilienceModule } from 'nestjs-resilience';
import { DataSource } from 'typeorm';

import { configuration } from '@configuration/configuration';
import { configurationValidate } from '@configuration/configuration.validate';
import { datasourceOptions } from '@configuration/orm.configuration';

import { CommonModule } from '@common/common.module';

import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { BlockchainNetworkStatusModule } from './modules/blockchainNetworkStatus/blockchainNetworkStatus.module';
import { CollectionModule } from './modules/collection/collection.module';
import { EnvironmentModule } from './modules/environment/environment.module';
import { EphemeralEnvironmentModule } from './modules/ephemeralEnvironment/ephemeralEnvironment.module';
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
    SentryModule.forRoot(),
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
    AuthModule,
    AuthorizationModule,
    CollectionModule,
    EnvironmentModule,
    FolderModule,
    InvitationModule,
    InvocationModule,
    MethodModule,
    UserRoleToTeamModule,
    TeamModule,
    UserModule,
    BlockchainNetworkStatusModule,
    EphemeralEnvironmentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
  exports: [],
})
export class AppModule {}
