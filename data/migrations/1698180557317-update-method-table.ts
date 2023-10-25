import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMethodTable1698180557317 implements MigrationInterface {
  name = 'UpdateMethodTable1698180557317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD \`inputs\` json NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD \`outputs\` json NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`method\` DROP COLUMN \`outputs\``);
    await queryRunner.query(`ALTER TABLE \`method\` DROP COLUMN \`inputs\``);
  }
}
