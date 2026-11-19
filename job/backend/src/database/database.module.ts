import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Session,
  Company,
  Job,
  Application,
  SavedJob,
  JobAlert,
} from './entities';

const ENTITIES = [User, Session, Company, Job, Application, SavedJob, JobAlert];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        // Isolates every jobportal_* table inside its own Postgres schema —
        // this schema must already exist (CREATE SCHEMA IF NOT EXISTS ...);
        // TypeORM does not create the schema itself, only the tables in it.
        schema: config.get<string>('database.schema'),
        entities: ENTITIES,
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<string>('nodeEnv') === 'development' ? ['error', 'warn'] : false,
      }),
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
