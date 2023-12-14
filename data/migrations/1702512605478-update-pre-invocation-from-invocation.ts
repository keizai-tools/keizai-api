import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePreInvocationFromInvocation1702512605478
  implements MigrationInterface
{
  name = 'UpdatePreInvocationFromInvocation1702512605478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`pre_invocation\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`pre_invocation\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`pre_invocation\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`pre_invocation\` varchar(255) NULL`,
    );
  }
}
