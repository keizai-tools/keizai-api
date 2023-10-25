import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocsToMethodTable1698191894065 implements MigrationInterface {
  name = 'AddDocsToMethodTable1698191894065';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD \`docs\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`method\` DROP COLUMN \`docs\``);
  }
}
