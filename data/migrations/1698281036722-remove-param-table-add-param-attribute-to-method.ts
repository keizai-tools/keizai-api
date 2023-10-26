import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveParamTableAddParamAttributeToMethod1698281036722
  implements MigrationInterface
{
  name = 'RemoveParamTableAddParamAttributeToMethod1698281036722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`method\` ADD \`params\` json NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`method\` DROP COLUMN \`params\``);
  }
}
