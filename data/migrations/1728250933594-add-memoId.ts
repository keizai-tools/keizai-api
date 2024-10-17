import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemoId1728250933594 implements MigrationInterface {
  name = ' AddMemoId1728250933594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`memo_id\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`memo_id\``);
  }
}
