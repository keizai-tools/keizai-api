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
import { InvocationModule } from './modules/invocation/invocation.module';

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
    AuthModule,
    CollectionModule,
    FolderModule,
    InvocationModule,
    CommonModule,
    EnviromentModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
