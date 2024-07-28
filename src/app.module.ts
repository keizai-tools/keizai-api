import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResilienceModule } from 'nestjs-resilience';
import { DataSource } from 'typeorm';

import { configuration } from '@configuration/configuration';
import { configurationValidate } from '@configuration/configuration.validate';
import { datasourceOptions } from '@configuration/orm.configuration';

import { CommonModule } from '@common/common.module';

import { AuthModule } from './modules/auth/auth.module';
import { CollectionModule } from './modules/collection/collection.module';
import { EnviromentModule } from './modules/enviroment/enviroment.module';
import { FolderModule } from './modules/folder/folder.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { InvocationModule } from './modules/invocation/invocation.module';
import { UserRoleToTeamModule } from './modules/role/role.module';
import { TeamModule } from './modules/team/team.module';

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
    CollectionModule,
    FolderModule,
    AuthModule,
    InvocationModule,
    EnviromentModule,
    TeamModule,
    InvitationModule,
    UserRoleToTeamModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
