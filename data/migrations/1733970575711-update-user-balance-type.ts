import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserBalanceType1733970575711 implements MigrationInterface {
  name = ' UpdateUserBalanceType1733970575711';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`balance\``);
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`balance\` float NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`balance\``);
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`balance\` int NULL`);
  }
}
