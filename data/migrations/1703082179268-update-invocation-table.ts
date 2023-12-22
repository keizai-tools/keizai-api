import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInvocationTable1703082179268 implements MigrationInterface {
  name = 'UpdateInvocationTable1703082179268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`post_invocation\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`post_invocation\``,
    );
  }
}
