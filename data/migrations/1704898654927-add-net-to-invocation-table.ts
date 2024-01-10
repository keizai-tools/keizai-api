import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNetToInvocationTable1704898654927
  implements MigrationInterface
{
  name = 'AddNetToInvocationTable1704898654927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` ADD \`network\` varchar(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`invocation\` DROP COLUMN \`network\``,
    );
  }
}
