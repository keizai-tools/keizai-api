import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameEnvironmentTable1732118619753 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE enviroment RENAME TO environment`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE environment RENAME TO enviroment`);
  }
}
