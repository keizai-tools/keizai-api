import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvocationTable1700791299201 implements MigrationInterface {
  name = 'UpdateInvocationTable1700791299201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`pre_invocation\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`pre_invocation\``,
    );
  }
}
