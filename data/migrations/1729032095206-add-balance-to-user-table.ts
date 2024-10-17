import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBalanceToUserTable1729032095206 implements MigrationInterface {
  name = ' AddBalanceToUserTable1729032095206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` ADD \`balance\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`balance\``);
  }
}
